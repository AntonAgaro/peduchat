// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    process.env.APP_ENV === 'dev' ? '@nuxt/eslint' : '',
    '@nuxt/ui',
    process.env.APP_ENV === 'dev' ? '@nuxt/test-utils' : '',
  ],
  css: ['~/assets/css/main.css'],
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  app: {
    head: {
      script: [
        {
          innerHTML: `
            
                (function(m,e,t,r,i,k,a){
                    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                    m[i].l=1*new Date();
                    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105568784', 'ym');
            
                ym(105568784, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            
            `,
          type: 'text/javascript',
        },
      ],
      noscript: [
        {
          innerHTML: `<div><img src="https://mc.yandex.ru/watch/105568784" style="position:absolute; left:-9999px;" alt="" /></div>`,
        },
      ],
    },
  },
  //Для теста на локалхосте
  // devServer: {
  //   host: '0.0.0.0',
  //   https: true,
  // },
});
