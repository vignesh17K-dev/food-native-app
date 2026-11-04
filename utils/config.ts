const config = {
  api: {
    baseUrl: "https://food-app-backend-flame-omega.vercel.app",
    baseUrlStaging:
      "https://food-app-backend-git-staging-vignesh17-projects.vercel.app/",
  },
  supabase: {
    url: "https://nhivnrtnwavstvuxrmbf.supabase.co",
    anonKey: "sb_publishable_8QN1TwINCyhyelJ593wTHQ_r3XdKVic",
  },
  pusher: {
    apiKey: "3b9ac8d21967a2239e94",
    cluster: "ap2",
  },
  google: {
    mapsApiKey: "AIzaSyCLkqj7drbNFtxvtc_8lnE98dtF0z5ed9k",
  },
} as const;

export default config;
