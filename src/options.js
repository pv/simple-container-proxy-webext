'use strict';

document.addEventListener("DOMContentLoaded", function() {
    var proxymap

    async function save_settings() {
        await browser.storage.local.set({ proxymap: proxymap })
    }

    function save_one_proxy(pmap, cookieStoreId, text) {
        if (text == "direct") {
            pmap.set(cookieStoreId, { type: "direct" })
            return
        }

        var m = /^(.*):([0-9]+)$/.exec(text)
        if (m) {
            pmap.set(cookieStoreId, {
                type: "socks",
                host: m[1],
                port: Number(m[2]),
                proxyDNS: true
            })
            return
        }
    }

    async function save() {
        var proxy = document.querySelector('.default-container.proxy')
        var new_proxymap = new Map()

        save_one_proxy(new_proxymap, null, proxy.value)

        var k = 0
        while (true) {
            var cookieStoreId = document.querySelector('.container-' + k + '.cookieStoreId')
            if (cookieStoreId === null) {
                break
            }

            var proxy = document.querySelector('.container-' + k + '.proxy')
            save_one_proxy(new_proxymap, cookieStoreId.value, proxy.value)

            k += 1
        }

        proxymap = new_proxymap
        
        await save_settings()
    }

    async function load_settings() {
        var result = await browser.storage.local.get('proxymap')
        var old_proxymap = result.proxymap

        if (old_proxymap === undefined) {
            old_proxymap = new Map()
        }

        proxymap = new Map()

        for (let [key, value] of old_proxymap) {
            proxymap.set(key, value)
        }
    }

    async function load() {
        await load_settings()

        var proxy_info = proxymap.get(null)
        var proxy = document.querySelector('.default-container.proxy')
        if (proxy_info === undefined || proxy_info.type == "direct") {
            proxy.value = "direct"
        }
        else {
            proxy.value = '' + proxy_info.host + ':' + proxy_info.port
        }

        var container_div = document.querySelector('#containers')
        var containers = await browser.contextualIdentities.query({})

        clear()

        for (let k = 0; k < containers.length; ++k) {
            var div = document.createElement('div')
            div.setAttribute('class', 'proxydiv')

            var name = document.createElement('span')
            name.innerText = containers[k].name + ': '
            div.append(name)

            var cookieStoreId = document.createElement('input')
            cookieStoreId.setAttribute('class', 'container-' + k + ' cookieStoreId')
            cookieStoreId.setAttribute('type', 'hidden')
            cookieStoreId.value = containers[k].cookieStoreId
            div.append(cookieStoreId)

            var proxy = document.createElement('input')
            proxy.setAttribute('class', 'container-' + k + ' proxy')

            var proxy_info = proxymap.get(containers[k].cookieStoreId)
            if (proxy_info !== undefined) {
                if (proxy_info.type == 'direct') {
                    proxy.value = 'direct'
                }
                else {
                    proxy.value = '' + proxy_info.host + ':' + proxy_info.port
                }
            }
            div.append(proxy)

            container_div.append(div)
        }
    }

    function clear() {
        var items = document.querySelectorAll('.proxydiv')
        for (let item of items) {
            item.remove()
        }
    }

    var save_button = document.querySelector('#save-button')
    save_button.addEventListener('click', function(event) {
        save().then(function() {
            load().then(function() {})
        })
    })

    load().then(function() {})
})
