const LOGO_CELL_NAME = 'LogoCell';
const KPI_VIEW_AREA_ITEM_NAME = 'KPIs';
const REQUEST_LIST_AREA_ITEM_NAME = 'Requests';
const HEADER_AREA_ITEM_NAME = 'Header';
const SEARCH_BAR_CONTROL_NAME = "Auto-Complete";

const MOBILE_HEADER_HEIGHT = 100;

detectClicks = () => {
    $(document).click(function (event) {
        console.log(event.target)
    });
}

isMobile = () => $('html').hasClass("mobile");

$(document).ready(function () {
    enableTheme();
    render();
    //    detectClicks();
});

enableTheme = () => {
    $('body').addClass('psf');
    $('form').addClass('psf');
    $('.runtime-content').addClass('psf');
    $('.runtime-form').addClass('psf');
}

render = () => {
    renderHeader();
    renderNavigation();
    renderKPIs();
    renderSearchBox();
}

renderNavigation = () => isMobile() ? renderDrawer() : renderSidebar();

renderSidebar = () => {
    const sidebar = $("<div id='sidebar' class='sidebar'></div>");
    $('.runtime-content').append(sidebar);
    $('.runtime-content').addClass('with-sidebar');
    if (!isMobile()) {
        let logoSpan = $('span[name="' + LOGO_CELL_NAME + '"]');
        logoSpan.addClass('logo');
        $('<div id="logo" class="logo">' + logoSpan.html() + '</div>').prependTo($('#sidebar'));
        $('div.logo').height($('div.header').height())
    };
    if ($('ul.tab-box-tabs').length > 0) {
        $('#sidebar').append('<div id="tabs" class="sidebar-tabs">')
        $('.sidebar-tabs').append($('ul.tab-box-tabs'));
        $('a.tab').append('<div class="sidebar-border"><span class="top"></span><span class="bottom"></span></div>');
    }

}

renderKPIs = () => {
    $('div[name="' + KPI_VIEW_AREA_ITEM_NAME + '"]').closest('.view').addClass('kpi')
    renderKPICard("active", 1);
    renderKPICard("overdue", 3);
    renderKPICard("urgent", 5);
    renderActionCard("new", 1, "btnNavNew");
    renderActionCard("reports", 2, "btnNavReporting");
    renderActionCard("admin", 3, "btnNavAdmin");
    renderListView();
}

renderKPICard = (name, cardIndex) => {
    $('<div id="' + name + '" class="card ' + name + '">').prependTo('div[name="tblKPIs"]')
    cardDiv = $('#' + name)
    labelSpan = $('.psf div.kpi .panel-body-wrapper div[name="tblResponsiveIcons"]> span[col="1"] > div > span[col="' + cardIndex + '"][row="1"]');
    labelSpan.addClass('kpi-label');
    imageSpan = $('.psf div.kpi .panel-body-wrapper div[name="tblResponsiveIcons"]> span[col="1"] > div > span[col="' + cardIndex + '"][row="2"]');
    imageSpan.addClass('kpi-icon');
    numberSpan = $('.psf div.kpi .panel-body-wrapper div[name="tblResponsiveIcons"]> span[col="1"] > div > span[col="' + (cardIndex + 1) + '"][row="2"]');
    numberSpan.addClass('kpi-number');
    textSpan = $('.psf div.kpi .panel-body-wrapper div[name="tblResponsiveIcons"]> span[col="1"] > div > span[col="' + cardIndex + '"][row="3"]');
    textSpan.addClass('kpi-text');

    [labelSpan, imageSpan, numberSpan, textSpan].forEach((e) => cardDiv.append(e));
}

renderActionCard = (name, cardIndex, btnName) => {
    $('<div id="' + name + '" class="actions card ' + name + '">').appendTo('div[name="tblKPIs"]')
    cardDiv = $('#' + name)
    labelSpan = $('.psf div.kpi .panel-body-wrapper div[name="tblResponsiveIcons"]> span[col="3"] > div > span[col="' + cardIndex + '"][row="1"]');
    labelSpan.addClass('kpi-label');
    imageSpan = $('.psf div.kpi .panel-body-wrapper div[name="tblResponsiveIcons"]> span[col="3"] > div > span[col="' + cardIndex + '"][row="2"]');
    imageSpan.addClass('kpi-icon');
    textSpan = $('.psf div.kpi .panel-body-wrapper div[name="tblResponsiveIcons"]> span[col="3"] > div > span[col="' + cardIndex + '"][row="3"]');
    textSpan.addClass('kpi-text');

    [labelSpan, imageSpan, textSpan].forEach((e) => cardDiv.append(e));
    //$('div.card.' + name).click(() => $('div.card.' + name + '>span>img').click());
    $(cardDiv).click(function() { $("[name='" + btnName + "']").trigger('click') });
}

renderListView = () => {
    $('div[name="' + REQUEST_LIST_AREA_ITEM_NAME + '"]').closest('.view').addClass('requests');
}

/* LIST VIEW AS CARDS */
/*────────────────────────── CONFIG ──────────────────────────*/
const DEBUG   = true;
const GRID    = '.grid-content-table';
const TBODY   = GRID + ' tbody';
const WRAPPER = '.grid-body-content-wrapper';
/*────────────────────────────────────────────────────────────*/

let colNames = [];
let cardMap  = new Map();
let rowObs   = null;

function log(...a){ if (DEBUG) console.log('[Cards]', ...a); }

/*──────────────────────  INITIAL WAIT  ─────────────────────*/
function initWhenReady(){
  const table   = document.querySelector(GRID);
  const headers = document.querySelectorAll(
       '.grid-column-header-table .grid-column-header-text');

  if (table && headers.length){
      colNames = [...headers].map(h => h.textContent.trim());
      log('Grid detected with headers:', colNames);
      buildCards();
      attachObserver();

      /* 🟢 hide visually WITHOUT display:none */
      $(GRID).css({position:'absolute', left:'-9999px', top:'-9999px',
                   height:0, width:0, overflow:'hidden'});

        /* hide the column-header bar as well */
        $('.grid-column-headers').css({position:'absolute', left:'-9999px', top:'-9999px',
            height:0, width:0, overflow:'hidden'});

  } else { setTimeout(initWhenReady, 100); }
}

/*────────────────────  BUILD ALL CARDS  ────────────────────*/
function buildCards () {
    log('[Cards] Building cards …');

    const $wrapper = $(WRAPPER);
    $wrapper.find('.grid-card-container').remove();
    cardMap.clear();

    const $cc = $('<div class="grid-card-container"></div>');

    $(TBODY).children('tr').each((idx, tr) => {
        const $tr  = $(tr);
        const $tds = $tr.children('td');

        // Skip the “No items to display” row or any row with wrong cell count
        if ($tr.hasClass('empty-grid') || $tds.length !== colNames.length) return;

        /* ------------------------------------------------------------------ */
        /* build the values array                                             */
        /* ------------------------------------------------------------------ */
        const vals = colNames.map((_, i) => $tds.eq(i).text().trim());

        // ---------------------------------------

        // decide which columns we’ll keep
        // ---------------------------------------
        const leadCols  = 2;                       // always take first two
        const tailMax  = 4;                       // …plus up-to 4 from the end
        const tailCols = Math.min(
            tailMax,
            colNames.length - leadCols            // don’t overlap if table is short
        );

        // indices we’ll actually render
        const keepIdxs = [
            ...Array.from({length: leadCols}, (_, i) => i),                        // 0,1
            ...Array.from({length: tailCols}, (_, i) => colNames.length - tailCols + i)
        ];
        // e.g. if 8 cols ⇒ [0,1,4,5,6,7]; if 5 cols ⇒ [0,1,3,4], etc.


        const picked = keepIdxs.map(i => ({
            name : colNames[i],
            value: vals[i]
        }));

        /* ------------------------------------------------------------------ */
        /* create the card                                              */
        /* ------------------------------------------------------------------ */

        // ── build card header ──
        const $card = $(`
          <div class="grid-card">
            <div class="card-header-row">
              <div class="card-title">${vals[1]}</div>
              <div class="card-meta">
                <span class="card-meta-label">${colNames[0]}</span>&nbsp;${vals[0]}
              </div>
            </div>
          </div>`);

        // ── details (everything after the first two) ──
        const rest = picked.slice(2);
        if (rest.length){
            const $grid = $('<div class="card-details-grid"></div>');
            for (let i = 0; i < rest.length; i += 2){
                const $row = $('<div class="card-detail-row"></div>')
                    .append(detailCell(rest[i].name, rest[i].value));
                if (i+1 < rest.length)
                    $row.append(detailCell(rest[i+1].name, rest[i+1].value));
                else
                    $row.find('.card-detail-cell').addClass('card-detail-cell-full');
                $grid.append($row);
            }
            $card.append($grid);
        }


        $card.data('rowEl', tr); 

        $card.on('click dblclick', function (evt) {
            const rowEl = $(this).data('rowEl');
            if (!rowEl) return;

            /* re-emit a *native* MouseEvent so any DOM listener of the grid
               behaves exactly as if the user clicked the real row */
            rowEl.dispatchEvent(new MouseEvent(evt.type, {
                bubbles   : true,
                cancelable: true,
                view      : window,
                detail    : evt.detail,
                screenX   : evt.screenX,
                screenY   : evt.screenY,
                clientX   : evt.clientX,
                clientY   : evt.clientY,
                ctrlKey   : evt.ctrlKey,
                shiftKey  : evt.shiftKey,
                altKey    : evt.altKey,
                metaKey   : evt.metaKey,
                button    : evt.button
            }));

            // doing it like this, only single clicks work - there's no pause to read a double-click.
            //$(rowEl).trigger(evt.type);
        });

        /* ------------------------------------------------------------------ */
        /* drop the finished card into the container and map it back          */
        /* ------------------------------------------------------------------ */
        $cc.append($card);
        cardMap.set(tr, $card);
    });

    $wrapper.append($cc);
    log(`[Cards] Finished. Cards created: ${cardMap.size}`);
}

/* helper that builds a single value/label cell */
function detailCell (label, value) {
    return $(`
        <div class="card-detail-cell">
            <div class="card-detail-label">${label}</div>
            <div class="card-detail-value">${value}</div>
        </div>`);
}


/*──────────────  SHOW/HIDE CARDS (no rebuild)  ─────────────*/
function rowIsShown(tr){
   /* 🟢 Only the row’s own display matters. */
   return $(tr).css('display') !== 'none';
}
function updateCardVisibility(){
   cardMap.forEach(($card, tr) => { $card.toggle( rowIsShown(tr) ); });
}

/*───────────────  OBSERVE REAL CHANGES ONLY  ───────────────*/
function attachObserver(){
   const tbody = document.querySelector(TBODY);
   if (!tbody) return;

   const cfg = {childList:true, subtree:true,
                attributes:true, attributeFilter:['style','class']};

   rowObs = new MutationObserver(list => {
       const structure = list.some(r => r.addedNodes.length || r.removedNodes.length);
       if (structure){
           log('Row add/remove detected – rebuilding cards');
           buildCards();
       } else {
           updateCardVisibility();
       }
   });
   rowObs.observe(tbody, cfg);
   log('Observer attached');
}

/*────────────────────────────────────────────────────────────*/
$(document).ready(initWhenReady);

 /* END OF CARDS */

renderHeader = () => {
    $('div[name="' + HEADER_AREA_ITEM_NAME + '"]').closest('.view').addClass('header');
    $('span[name="' + LOGO_CELL_NAME + '"]').addClass('logo');
    if (isMobile()) {
        renderMobileHeader();
    }
}

renderSearchBox = () => {
    $('div[name="' + SEARCH_BAR_CONTROL_NAME + '"]').addClass('search-control');
}

renderMobileHeader = () => {
    var headerView = $('.header')

    var headerOffset = 0;
    $('form').scroll(function () {
        var currentPos = $('form').scrollTop()
        if (headerOffset === 0) {
            headerOffset = headerView.height() / 2;
        }
        if (currentPos >= headerOffset) {
            headerView.addClass('fixed');
        } else {
            headerView.removeClass('fixed');
        }
    });
}

function renderSlider() {
    
    $("#sidebar").css("display", "none");
    var imageHtmlCollapsed = '<span class="material-symbols-outlined">menu</span>';
    var imageHtmlExpanded = '<span class="material-symbols-outlined">menu_open</span>';
    var sidebarToggle = $("#sidebar-handler");

    // Check if the sidebar handler exists, if not, create it
    if (sidebarToggle.length === 0) {
        var html = '<div id="sidebar-handler" class="sidebar-handler">' + imageHtmlCollapsed + '</div>';
        $("#sidebar").before(html);
        sidebarToggle = $("#sidebar-handler"); // Re-assign to the newly created element
    }

    //Close on tab click
    $('span.tab-text').click(function() {
        console.log('tab clicked');
        $("#sidebar").css("display", "none");
        $("#sidebar").removeClass("left-shadow-overlay");
    });
    
    $('#sidebar-handler').click(function() {
        console.log('clicked burger')
        if($("#sidebar").css("display") === "none"){
            $("#sidebar").css("display", "grid");
            $("#sidebar").addClass("left-shadow-overlay");
            var sidebarWidth = $("#sidebar").outerWidth();
            $("#").css("margin-left", sidebarWidth + "px");
        }
        else
        {
            $("#sidebar").css("display", "none");
            $("#sidebar").removeClass("left-shadow-overlay");
            $("#").css("margin-left", "0px");
        }
    });    
}

renderDrawer = () => {
    renderSidebar();
    renderSlider();
}

/*

$('input[name="Search Box"]').keypress(function (e) {
        var key = e.which;
        if (key == 13) {
            var value = e.currentTarget.value;
            $(e.currentTarget).SFCTextBox('option', 'text', value);
            $('a[name ="Search Button"]').click();
            return false;
        }
    })
*/