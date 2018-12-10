function createHooks() {
    ids = new Set();
    thistab = 0;
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        chrome.storage.sync.get("ignoreList", function(value) {
            tabduplicate(value["ignoreList"], tabId, changeInfo, tab)

        })
    });
}

function tabduplicate(ignorelist = [], tabId, changeInfo, tab) {
    chrome.storage.sync.get("playpause", function(value){
        console.log(value)
        if (!value.playpause) {
           thistab = tabId
           if (changeInfo.status == 'complete' && tab.active) {
            chrome.tabs.query({}, function test(test) {
                for (variable of test) {

                    if (tab.url == variable.url && 
                        !(tabId == variable.id) && 
                        !(tab.url == "chrome://newtab/") && 
                        isDomainIgnored(tab.url, ignorelist)) {
                        ids.add(variable.id)
                }
            }
        });
            setTimeout(function() {
                if (ids.size > 0) {
                    myids = ids;
                    ids = new Set();

                    chrome.notifications.create("", {
                        type: "basic",
                        iconUrl: 'logo.png',
                        title: "Duplicate",
                        message: tab.url + " open " + myids.size + " times",
                        contextMessage: "Duplicate page found",
                        buttons: [{
                            title: "Close this, go to other",
                            iconUrl: 'leave.png',
                        }, {
                            title: "Close other, keep this",
                            iconUrl: 'close.png',
                        }]
                    }, function(id) {
                        myNotificationID = id;
                    });
                    /* Respond to the user's clicking one of the buttons */
                    chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
                        if (notifId === myNotificationID) {
                            if (btnIdx === 0) {
                                picked = myids.values().next().value
                                myids.add(thistab)
                                myids.forEach(function(item) {
                                    if (item !== picked) {
                                        chrome.tabs.remove(item, function() {})
                                    }

                                })
                                chrome.tabs.update(picked, {
                                    selected: true
                                });

                                chrome.notifications.clear(notifId, function() {})
                            } else if (btnIdx === 1) {

                                myids.forEach(function(item) {
                                    chrome.tabs.remove(item, function() {})
                                })
                                chrome.notifications.clear(notifId, function() {})

                            }
                        }
                    });

                }
            }, 100)
        }
    }
})

}

function getDomain(url, prematch) {
    var prefix = /^https?:\/\//;
    var domain = /^[^\/]+/;
    var postfix = /\//
    // remove any prefix
    url = url.replace(prefix, "");
    url = url.replace(postfix, "");
    // assume any URL that starts with a / is on the current page's domain

    // now extract just the domain
    var match = url.match(domain);
    if (match) {
        return (match[0]);
    }
    return (null);
}

function getIgnores(urls) {
    newurls = []
    urls.forEach(function(url) {
        newurls.push(getDomain(url));
    })
    return newurls;
}

function getHostName(url) {
    var match = url.match(/(https?:\/\/)?(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[3] === 'string' && match[3].length > 0) {
        return match[3];
    }
    else {
        return null;
    }
}

function _getDomain(url) {
    var hostName = getHostName(url);
    var domain = hostName;
    
    if (hostName != null) {
        var parts = hostName.split('.').reverse();
        
        if (parts != null && parts.length > 1) {
            domain = parts[1] + '.' + parts[0];
            
            if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
              domain = parts[2] + '.' + domain;
          }
      }
  }
  
  return domain;
}

function isDomainIgnored(domain, Ignores) {
    check_lists = getIgnores(Ignores)
    this_domain = getDomain(domain)
    console.log("getting called", Ignores)
    for(index in check_lists){
        url = check_lists[index]
        console.log(url)
        if (url.indexOf("*") > -1) {
            // we just care if the Ignores match
            url = _getDomain(url)
            if (_getDomain(this_domain) === url) {
                console.log("returning false")
                console.log(this_domain + "==" + url)
                return false
            }
        }
        if (this_domain === url) {
            console.log("returning false")
            console.log(this_domain + "==" + url)
            return false
        }

    }
    console.log("returning true")
    return true
    
}

function main() {

}


document.addEventListener('DOMContentLoaded', function() {
    createHooks();
    main();
});
