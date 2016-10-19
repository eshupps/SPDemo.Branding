Function.registerNamespace('Contoso.CustomNavigation');

var count = 1;
var liCount = 0;
var sortedItems = new Array();

Contoso.CustomNavigation.Item = function (title, url, path, sortOrder, nt, sortLevel) {
    this.title = title;
    this.url = url;
    this.path = path;
    this.sortOrder = sortOrder;
    this.sortLevel = sortLevel;
    var isRoot = false;
    var subpath = path.split(';');
    if (subpath.length == 1) {
        isRoot = true;
    }
    this.isRoot = isRoot;
    this.nt = nt;
};
function createHtml(title, url, path, isRoot, count, nt, sort, level) {
    var html = '';
    
    if (isRoot) {
        if (count != 1)
            html += '</li>';
        var selected = '';
        var loc = document.location.toString();
        var sp = loc.split('/');
        var foundTitle = false;
        var country = false;
        var region = false;

        liCount = count;
        html += '<li class="' + selected + '"><span class="title" style="display:none;">' + title + '</span><a href=' + url + '><span>' + nt + '</span></a><ul id="navbarlist-' + liCount + '"></ul>';
        var nav = document.getElementById('navbarlist');
        nav.innerHTML += html;
    }
    else
    {
        var style = '';
        
        switch (level) {
            case "1":
                break;
            case "2":
                style = "font-weight:bold!important;color:#07BDFF!important;";
                break;
            case "3":
                style = "padding-left:10px;width:100%!important;";
                break;
        }
        html += '<li><a href=' + url + '><div style="' + style + '">' + nt + '</div></a></li>';
        var list = 'navbarlist-' + liCount;
        var nav = document.getElementById(list);
        nav.innerHTML += html;
    }
    setSelectedNavNode(path, url);
}

Contoso.CustomNavigation.viewModel = {
    customMenuItems: new Array()
};

Contoso.CustomNavigation.init = function (id) {
    this.termSetId = id;
    
    SP.SOD.executeOrDelayUntilScriptLoaded(Function.createDelegate(this, function () {
        'use strict';
        this.nid = SP.UI.Notify.addNotification("<img src='/_layouts/15/images/loadingcirclests16.gif?rev=23' style='vertical-align:bottom; display:inline-block; margin-" + (document.documentElement.dir == "rtl" ? "left" : "right") + ":2px;' />&nbsp;<span style='vertical-align:top;'>Loading navigation...</span>", false);

        var taxonomySodLoaded = false;

        if (typeof (_v_dictSod) != 'undefined' &&
           _v_dictSod['sp.taxonomy.js'] == null) {
            SP.SOD.registerSod('sp.taxonomy.js', SP.Utilities.Utility.getLayoutsPageUrl('sp.taxonomy.js'));
        }
        else {
            taxonomySodLoaded = _v_dictSod['sp.taxonomy.js'].state === Sods.loaded;
        }

        if (taxonomySodLoaded) {
            Function.createDelegate(this, Contoso.CustomNavigation.load)();
        }
        else {
            SP.SOD.executeFunc('sp.taxonomy.js', false, Function.createDelegate(this, Contoso.CustomNavigation.load));
        }
    }), 'sp.js');
};

Contoso.CustomNavigation.load = function () {
    var con = SP.ClientContext.get_current();
    var tax = SP.Taxonomy.TaxonomySession.getTaxonomySession(con);
    var store = tax.getDefaultSiteCollectionTermStore();
    var set = store.getTermSet(this.termSetId);
    var setTerms = set.getAllTerms();
    con.load(setTerms);
    con.executeQueryAsync(Function.createDelegate(this, function (sender, args) {
        var tEnumerator = setTerms.getEnumerator();
        while (tEnumerator.moveNext()) {
            var term = tEnumerator.get_current();
            var path = String(term.get_objectData().get_properties()['PathOfTerm']);
            var sortOrder = term.get_localCustomProperties()['sortOrder'];
            var url = term.get_localCustomProperties()['linkUrl']
            var sortLevel = term.get_localCustomProperties()['sortLevel'];
            var navTitle = term.get_name();
            Contoso.CustomNavigation.viewModel.customMenuItems.push(new Contoso.CustomNavigation.Item(navTitle, url, path, sortOrder, navTitle, sortLevel));
        }

        sortedItems = Contoso.CustomNavigation.viewModel.customMenuItems.sort(function (a, b) {

            var avalue = parseInt(a.sortOrder),
            bvalue = parseInt(b.sortOrder);
            if (avalue < bvalue) {
                return -1;
            }
            if (avalue > bvalue) {
                return 1;
            }
            return 0;
        });
        for (var i = 0; i < sortedItems.length; i++) {
            var title = sortedItems[i].title;
            var url = sortedItems[i].url;
            var path = sortedItems[i].path;
            var isRoot = sortedItems[i].isRoot;
            var sort = sortedItems[i].sortOrder;
            var level = sortedItems[i].sortLevel;
            var nt = sortedItems[i].nt;
            createHtml(title, url, path, isRoot, count, nt, sort, level);
            count++;
        }

        SP.UI.Notify.removeNotification(this.nid);
    }), Function.createDelegate(this, function (sender, args) {
        var nav = document.getElementById('topnavbar');
        nav.innerHTML = 'The navigation provider has changed, please contact the SharePoint system administrator.';
        console.log(args.get_message());
    }));

};
function setSelectedNavNode(path, url) {
    var loc = document.location.toString();
    var l = loc.split('/');
    var p = path.split(';');
    for (var i = 1; i < p.length; i++) {
        for (var j = l.length - 1 ; j > 0 ; j--) {
            if (p[i].toLowerCase().replace(' ', '') == l[j].toLowerCase()) {
                var p0 = p[0];
                $('#topnavbar > ul > li > span.title').each(function () {
                    if ($(this).text().toLowerCase() == p0.toLowerCase().replace(' ', '')) {
                        $(this).closest('li').addClass('selected');
                    }
                });

            }
        }
    }
}
