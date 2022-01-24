/// <reference types="cypress" />

describe('sidebar', () => {
  // Based on sidebar.js
  const defaultSectionName = 'getting-started';
  const basepath = '/docs/2.0/'
  beforeEach(() => {
    // Takes to starting url which is baseURL
    cy.visit(basepath)
  })

  describe('Full screen', () => {
    beforeEach(() => {
      cy.viewport(1280, 720)
    })

    it('should load sidebar in full screen', () => {
      // A nav should exist and one should have class sidebar
      cy.get('nav').should('exist').should('have.class', 'sidebar')

      // Sidebar should contain at least the default Section
      cy.get(`[data-section="${defaultSectionName}"]`).should('exist')
      cy.get('nav.sidebar').children('.sidebar-item-group').children('ul').should('have.length.greaterThan', 0)
    })

    it('should close getting started and open pipelines', () => {
      // Check defaultSectionName open then close defaultSectionName
      cy.get('nav.sidebar').children('.sidebar-item-group').children('ul').children(`[data-section="${defaultSectionName}"]`).should('not.have.class', 'closed').children('.list-wrap').click()
      // Check defaultSectionName closed then open
      cy.get('nav.sidebar').children('.sidebar-item-group').children('ul').children(`[data-section="${defaultSectionName}"]`).should('have.class', 'closed').click().should('not.have.class', 'closed')
    })

    it('should bring you to right url', () =>{
      // Click second element in getting started which is migration-intro
      cy.get('nav.sidebar').children('.sidebar-item-group').children('ul').children(`[data-section="${defaultSectionName}"]`).children().next().click()
      cy.url().should('include', 'migration-intro')
      cy.get(`[href="${basepath}migration-intro/"]`).should('have.class', 'active')
    })

    it('should load a page open the right section in the sidebar', () =>{
      const path = `${basepath}pipelines/`
      cy.visit(`${path}`)
      cy.get('nav.sidebar').children('.sidebar-item-group').children('ul').children(`[data-section="pipelines"]`).should('not.have.class', 'closed')
      cy.get(`[href="${path}"]`).should('have.class', 'active')
    })
  })

  describe('Mobile', () => {
    beforeEach(() => {
      cy.viewport(320, 568)
    })

    it('should load sidebar closed in mobile', () => {
      // no sidebar should be visible
      cy.get('nav').should('have.css', 'display', 'none')

      // mobile sidebar
      cy.get('nav.mobile-sidebar').should('exist')
      cy.get('nav.mobile-sidebar').children('ul').should('have.length.greaterThan', 0)

      // sidebar open and close button
      cy.get('[data-target="#global-nav"]').should('exist')
      cy.get('[data-target="#global-nav"]').should('have.class', 'collapsed')
    })

    it('should open sidebar in mobile', () => {
      cy.get('[data-target="#global-nav"]').should('have.class', 'collapsed').click().should('not.have.class', 'collapsed')
      cy.get('nav.mobile-sidebar').should('have.class', 'mobile-sidebar').and('have.css', 'display', 'block')
    })

    describe('Open sidebar each time', () => {
      beforeEach(() => {
        cy.get('[data-target="#global-nav"]').click()
        cy.get('nav').should('have.class', 'sidebar').and('have.css', 'display', 'block').and('not.have.class', 'collapsed')
      })

      it('should close getting started and open pipelines', () => {
        // Check defaultSectionName closed then Open defaultSectionName
        cy.get('nav.mobile-sidebar').children('ul').children(`[data-section="${defaultSectionName}"]`).should('have.class', 'closed').children('.list-wrap').click()
        // Check defaultSectionName open then close defaultSectionName
        cy.get('nav.mobile-sidebar').children('ul').children(`[data-section="${defaultSectionName}"]`).should('not.have.class', 'closed').children('.list-wrap').click()
        // Check defaultSectionName closed
        cy.get('nav.mobile-sidebar').children('ul').children(`[data-section="${defaultSectionName}"]`).should('have.class', 'closed')
      })

      it('should bring you to right url', () =>{
        // Open getting started
        cy.get('nav.mobile-sidebar').children('ul').children(`[data-section="${defaultSectionName}"]`).should('have.class', 'closed').children('.list-wrap').click()
        // Click second element in getting started which is migration-intro
        cy.get('nav.mobile-sidebar').children('ul').children(`[data-section="${defaultSectionName}"]`).children().next().click()
        cy.url().should('include', 'migration-intro')
      })
    })
  })
})
