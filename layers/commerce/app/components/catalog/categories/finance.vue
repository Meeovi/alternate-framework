<template>
  <div>
    <v-card elevation="0" width="100%" class="mt-4">
      <v-card-text class="center-text">The below data is provided by Trading View and when clicking any of the links
        will take you to the full Trading View platform. Meeovi is not responsible for the data shown below or the
        website the links direct you to.</v-card-text>
    </v-card>

    <nav id="ticker-tape">
      <div class="tradingview-widget-container" ref="tickerTapeContainer">
        <div class="tradingview-widget-container__widget"></div>
      </div>
    </nav>
    <main>
      <section id="symbol-info">
        <div class="tradingview-widget-container" ref="symbolInfoContainer">
          <div class="tradingview-widget-container__widget"></div>
        </div>
      </section>

      <section id="advanced-chart">
        <div class="tradingview-widget-container" style="height: 100%; width: 100%" ref="advancedChartContainer">
          <div class="tradingview-widget-container__widget" style="height: calc(100% - 32px); width: 100%"></div>
        </div>
      </section>

      <section id="company-profile">
        <div class="tradingview-widget-container" ref="companyProfileContainer">
          <div class="tradingview-widget-container__widget"></div>
        </div>
      </section>

      <section id="fundamental-data">
        <div class="tradingview-widget-container" ref="fundamentalDataContainer">
          <div class="tradingview-widget-container__widget"></div>
        </div>
      </section>

      <section id="technical-analysis">
        <div class="tradingview-widget-container" ref="technicalAnalysisContainer">
          <div class="tradingview-widget-container__widget"></div>
        </div>
      </section>

      <section id="top-stories">
        <div class="tradingview-widget-container" ref="topStoriesContainer">
          <div class="tradingview-widget-container__widget"></div>
        </div>
      </section>
    </main>

    <v-card width="100%" class="mt-4" id="powered-by-tv">
      <v-card-text class="center-text">The above data is provided by Trading View and when clicking any of the links
        will take you to the full Trading View platform. Meeovi is not responsible for the data shown above or the
        website the links direct you to.</v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import {
    ref,
    onMounted
  } from 'vue'

  const route = useRoute()

  // DOM References
  const tickerTapeContainer = ref(null)
  const symbolInfoContainer = ref(null)
  const advancedChartContainer = ref(null)
  const companyProfileContainer = ref(null)
  const fundamentalDataContainer = ref(null)
  const technicalAnalysisContainer = ref(null)
  const topStoriesContainer = ref(null)

  // Helper to append TradingView embed scripts safely
  function loadTvWidget(containerRef, scriptSrc, config) {
    if (!containerRef) return
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = scriptSrc
    script.async = true
    script.innerHTML = JSON.stringify(config)
    containerRef.appendChild(script)
  }

  onMounted(() => {
    // SSR-safe query parameter reading via Nuxt useRoute()
    const activeSymbol = (route.query.tvwidgetsymbol)?.toString() || 'NASDAQ:AAPL'

    useHead({
      title: `Stock Details - ${activeSymbol}`
    })

    // 1. Ticker Tape Widget
    loadTvWidget(tickerTapeContainer.value,
      'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js', {
        symbols: [{
            description: '',
            proName: 'NASDAQ:TSLA'
          },
          {
            description: '',
            proName: 'NASDAQ:AAPL'
          },
          {
            description: '',
            proName: 'NASDAQ:NVDA'
          },
          {
            description: '',
            proName: 'NASDAQ:MSFT'
          },
          {
            description: '',
            proName: 'NASDAQ:AMZN'
          },
          {
            description: '',
            proName: 'NASDAQ:GOOGL'
          },
          {
            description: '',
            proName: 'NASDAQ:META'
          },
          {
            description: '',
            proName: 'NYSE:BRK.B'
          },
          {
            description: '',
            proName: 'NYSE:LLY'
          },
          {
            description: '',
            proName: 'NYSE:UNH'
          },
          {
            description: '',
            proName: 'NYSE:V'
          },
          {
            description: '',
            proName: 'NYSE:WMT'
          }
        ],
        showSymbolLogo: true,
        colorTheme: 'light',
        isTransparent: false,
        displayMode: 'adaptive',
        locale: 'en'
      })

    // 2. Symbol Info Widget
    loadTvWidget(symbolInfoContainer.value,
      'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js', {
        symbol: activeSymbol,
        width: '100%',
        locale: 'en',
        colorTheme: 'light',
        isTransparent: true
      })

    // 3. Advanced Chart Widget
    loadTvWidget(advancedChartContainer.value,
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js', {
        autosize: true,
        symbol: activeSymbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        allow_symbol_change: true,
        calendar: false,
        support_host: 'https://www.tradingview.com'
      })

    // 4. Company Profile Widget
    loadTvWidget(companyProfileContainer.value,
      'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js', {
        width: '100%',
        height: '100%',
        colorTheme: 'light',
        isTransparent: true,
        symbol: activeSymbol,
        locale: 'en'
      })

    // 5. Fundamental Data Widget
    loadTvWidget(fundamentalDataContainer.value,
      'https://s3.tradingview.com/external-embedding/embed-widget-financials.js', {
        colorTheme: 'light',
        isTransparent: true,
        largeChartUrl: '',
        displayMode: 'adaptive',
        width: '100%',
        height: '100%',
        symbol: activeSymbol,
        locale: 'en'
      })

    // 6. Technical Analysis Widget
    loadTvWidget(technicalAnalysisContainer.value,
      'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js', {
        interval: '15m',
        width: '100%',
        isTransparent: true,
        height: '100%',
        symbol: activeSymbol,
        showIntervalTabs: true,
        displayMode: 'single',
        locale: 'en',
        colorTheme: 'light'
      })

    // 7. Top Stories Widget
    loadTvWidget(topStoriesContainer.value,
      'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js', {
        feedMode: 'symbol',
        symbol: activeSymbol,
        colorTheme: 'light',
        isTransparent: true,
        displayMode: 'regular',
        width: '100%',
        height: '100%',
        locale: 'en'
      })
  })
</script>

<style scoped>
  :root {
    --gap-size: 32px;
  }

  main {
    display: grid;
    width: 100%;
    padding: 0 calc(var(--gap-size) * 0.5);
    max-width: 100%;
    grid-template-columns: 1fr 1fr;
    grid-gap: var(--gap-size);
    margin: 0 auto;
  }

  #symbol-info,
  #advanced-chart,
  #company-profile,
  #fundamental-data {
    grid-column: span 2;
  }

  #technical-analysis,
  #top-stories,
  #powered-by-tv {
    grid-column: span 1;
  }

  #ticker-tape {
    width: 100%;
    margin-bottom: var(--gap-size);
  }

  #advanced-chart {
    height: 500px;
  }

  #company-profile {
    height: 390px;
  }

  #fundamental-data {
    height: 490px;
  }

  #technical-analysis,
  #top-stories {
    height: 425px;
  }

  #powered-by-tv {
    display: flex;
    background: #f8f9fd;
    border: solid 1px #e0e3eb;
    text-align: justify;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    padding: 16px;
    border-radius: 6px;
  }

  #powered-by-tv a,
  #powered-by-tv a:visited {
    color: #2962ff;
  }

  @media (max-width: 800px) {

    main>section,
    #technical-analysis,
    #top-stories,
    #powered-by-tv {
      grid-column: span 2;
    }
  }
</style>