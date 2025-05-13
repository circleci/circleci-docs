module.exports = {
  content: [
    './src/**/*.hbs',
  ],
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
