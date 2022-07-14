/// <reference types="cypress" />
YAML = require('yamljs');
const slugify = require('slugify');

describe('sidebar', () => {
  // Based on sidebar.js
  const defaultSectionName = 'getting-started';
  const basepath = '/docs/';
  beforeEach(() => {
    cy.visit('/docs/');
  });

  describe('Not screen size dependant', () => {
    it.skip('should go through sidebar yml to see if all links exist in EN then JA', () => {
      cy.readFile('./jekyll/_data/sidenav.yml').then(function (yamlString) {
        const sidenav = YAML.parse(yamlString);
        for (let key of Object.keys(sidenav)) {
          cy.get('#globe-lang-btn').click();
          cy.get(`#globalNavLang-${key}`).click();

          for (let parent of sidenav[key]) {
            for (let child of parent.children) {
              if (child.children) {
                for (let subchild of child.children) {
                  if (subchild.link) {
                    const subchildlink =
                      subchild.link +
                      (subchild.hash ? `#${subchild.hash}` : '');
                    cy.get(`[href="/docs/${subchildlink}"]`).should('exist');
                  }
                }
              }
              if (child.link) {
                const childlink =
                  child.link + (child.hash ? `#${child.hash}` : '');
                cy.get(`[href="/docs/${childlink}"]`).should('exist');
              }
            }

            // slug is needed because data section is parent.name | slugify
            let slug = slugify(parent.name, {
              replacement: '-', // replace spaces with replacement character, defaults to `-`
              lower: true, // convert to lower case, defaults to `false`
            });
            cy.get(`[data-section="${slug}"]`).should('exist');
          }
        }
      });
    });
  });

  describe('Desktop', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should load sidebar', () => {
      // A nav should exist and one should have class sidebar
      cy.get('nav').should('exist').should('have.class', 'sidebar');

      // Sidebar should contain at least the default Section
      cy.get(`[data-section="${defaultSectionName}"]`).should('exist');
      cy.get('nav.sidebar')
        .children('.sidebar-item-group')
        .children('ul')
        .should('have.length.greaterThan', 0);
    });

    it('should close a section', () => {
      // Check defaultSectionName open then close defaultSectionName
      cy.get('nav.sidebar')
        .children('.sidebar-item-group')
        .children('ul')
        .should('not.have.class', 'closed')
        .last()
        .click()
        .should('not.have.class', 'closed');
    });

    it('should open a section', () => {
      // Check defaultSectionName closed then open
      cy.get('nav.sidebar')
        .children('.sidebar-item-group')
        .children('ul')
        .children('.closed')
        .last()
        .click()
        .should('not.have.class', 'closed');
    });

    it('should bring you to right url for configuration reference', () => {
      // start where configuration is closed
      cy.get('nav.sidebar div.sidebar-item-group')
        .children('ul')
        .children(`[data-section="configuration"]`)
        .should('have.class', 'closed')
        .click()
        .should('not.have.class', 'closed');
      cy.get('nav.sidebar div.sidebar-item-group')
        .children('ul')
        .children(`[data-section="configuration"]`)
        .children('ul.subnav')
        .children('ul')
        .children('li.subnav-item')
        .children(`[href="${basepath}configuration-reference/"]`)
        .click();
      // Navigate to configuration-reference now `configuration` is open and configuration-reference is active
      cy.url().should('include', 'configuration-reference');
      cy.get('nav.sidebar div.sidebar-item-group')
        .children('ul')
        .children(`[data-section="configuration"]`)
        .should('not.have.class', 'closed');
      cy.get('nav.sidebar div.sidebar-item-group')
        .children('ul')
        .children(`[data-section="configuration"]`)
        .children('ul.subnav')
        .children('ul')
        .children('li.subnav-item')
        .children(`[href="${basepath}configuration-reference/"]`)
        .should('have.class', 'active');
    });

    it('should bring you to right url for homepage', () => {
      // start where defaultSectionName is closed
      cy.visit(basepath + 'configuration-reference');
      cy.get('nav.sidebar div.sidebar-item-group')
        .children('ul')
        .children(`[data-section="${defaultSectionName}"]`)
        .should('have.class', 'closed')
        .click()
        .should('not.have.class', 'closed');
      cy.get('nav.sidebar div.sidebar-item-group')
        .children('ul')
        .children(`[data-section="${defaultSectionName}"]`)
        .children('ul.subnav')
        .children('ul')
        .children('li.subnav-item')
        .children(`[href="/docs/about-circleci/"]`)
        .click();
      // Navigate to homepage now defaultSectionName is open and defaultSectionName is active
      cy.url().should(
        'equal',
        Cypress.config().baseUrl + '/docs/about-circleci/',
      );
      cy.get('nav.sidebar div.sidebar-item-group')
        .children('ul')
        .children(`[data-section="${defaultSectionName}"]`)
        .should('not.have.class', 'closed');
      cy.get('nav.sidebar div.sidebar-item-group')
        .children('ul')
        .children(`[data-section="${defaultSectionName}"]`)
        .children('ul.subnav')
        .children('ul')
        .children('li.subnav-item')
        .children(`[href="/docs/about-circleci/"]`)
        .should('have.class', 'active');
    });
  });

  describe('Mobile', () => {
    beforeEach(() => {
      cy.viewport(320, 568);
    });

    it('should have sidebar closed by default', () => {
      // no sidebar should be visible
      cy.get('nav').should('have.css', 'display', 'none');

      // mobile sidebar
      cy.get('nav.mobile-sidebar').should('exist');
      cy.get('nav.mobile-sidebar')
        .children('ul')
        .should('have.length.greaterThan', 0);

      // sidebar open and close button
      cy.get('[data-target="#global-nav"]').should('exist');
      cy.get('[data-target="#global-nav"]').should('have.class', 'collapsed');
    });

    it('should open sidebar when clicking hamburger menu', () => {
      cy.get('[data-target="#global-nav"]')
        .should('have.class', 'collapsed')
        .click()
        .should('not.have.class', 'collapsed');
      cy.get('nav.mobile-sidebar')
        .should('have.class', 'mobile-sidebar')
        .and('have.css', 'display', 'block');
    });

    describe('Open sidebar each time', () => {
      beforeEach(() => {
        cy.get('[data-target="#global-nav"]').click();
        cy.get('nav')
          .should('have.class', 'sidebar')
          .and('have.css', 'display', 'block')
          .and('not.have.class', 'collapsed');
      });

      it('should close a section', () => {
        // Check defaultSectionName open then close defaultSectionName
        cy.get('nav.mobile-sidebar')
          .children('ul')
          .should('not.have.class', 'closed')
          .last()
          .click()
          .should('not.have.class', 'closed');
      });

      it('should open a section', () => {
        // Check defaultSectionName closed then open
        cy.get('nav.mobile-sidebar')
          .children('ul')
          .children('.closed')
          .last()
          .click()
          .should('not.have.class', 'closed');
      });

      it('should bring you to right url for configuration reference', () => {
        cy.get('nav.mobile-sidebar')
          .children('ul')
          .children(`[data-section="reference"]`)
          .should('have.class', 'closed')
          .click()
          .should('not.have.class', 'closed');
        cy.get('nav.mobile-sidebar')
          .children('ul')
          .children(`[data-section="reference"]`)
          .children('ul.subnav')
          .children('ul')
          .children('li.subnav-item')
          .children(`[href="${basepath}configuration-reference/"]`)
          .click();
        cy.url().should('include', 'configuration-reference');
      });

      it('should bring you to right url for homepage', () => {
        cy.get('nav.mobile-sidebar')
          .children('ul')
          .children(`[data-section="${defaultSectionName}"]`)
          .should('have.class', 'closed')
          .click()
          .should('not.have.class', 'closed');
        cy.get('nav.mobile-sidebar')
          .children('ul')
          .children(`[data-section="${defaultSectionName}"]`)
          .children('ul.subnav')
          .children('ul')
          .children('li.subnav-item')
          .children(`[href="/docs/about-circleci/"]`)
          .click();
        cy.url().should(
          'equal',
          Cypress.config().baseUrl + '/docs/about-circleci/',
        );
      });
    });
  });
});
