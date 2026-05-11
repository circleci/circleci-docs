module.exports = {
  content: [
    './src/**/*.hbs',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: { /* … */ },
  },
  plugins: [
    require('tailwind-scrollbar')({
      nocompatible: true,
      preferredStrategy: 'pseudoelements',
    }),
  ],
}
