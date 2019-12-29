'use strict';

(function() {
    class ProxyHandler {
        async getProxy(cookieStoreId) {
            var result = await browser.storage.local.get('proxymap')
            var proxymap = result.proxymap
            var proxy = proxymap.get(cookieStoreId)
            if (proxy === undefined) {
                return proxymap.get(null)
            }
            return proxy
        }

        async onRequest(requestDetails) {
            return this.getProxy(requestDetails.cookieStoreId)
        }

        async setupDefaultProxy() {
            var result = await browser.storage.local.get('proxymap')
            var proxymap = result.proxymap

            if (proxymap === undefined) {
                proxymap = new Map()
            }

            var proxy = proxymap.get(null)
            if (proxy === undefined) {
                proxymap[null] = { type: "direct" }
            }
        }

        start() {
            var proxyfilter = { urls: ['<all_urls>'] }
            var request_cb = this.onRequest.bind(this)
            this.setupDefaultProxy().then(function() {
                browser.proxy.onRequest.addListener(request_cb, proxyfilter)
            })
        }
    }

    var handler = new ProxyHandler()
    handler.start()
})();
