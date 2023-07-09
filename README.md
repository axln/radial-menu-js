# Radial Menu in Pure JavaScript, HTML and SVG

![Radial menu screenshot](https://raw.githubusercontent.com/axln/radial-menu-js/master/radial-menu.png)

## Controls

 1. Go to [radial-menu-js/index.html](https://axln.github.io/radial-menu-js/index.html).
 2. Click Open Menu button.
 3. You can use mouse, mouse wheel and keyboard for navigation:
    * Arrow keys and mouse wheel to select menu item.
    * Enter to choose the selected menu item.
    * Esc/Backspace to return to parent menu and close menu.
 
## Usage Example
 
 ```javascript
var svgMenu = new RadialMenu({
    parent      : document.body,
    size        : 400,
    closeOnClick: true,
    menuItems   : [
      {
        id: 'item1',
        title: 'Item 1'
      },
      {
        id: 'item2',
        title: 'Item 2'
      },
      {
        id: 'more',
        title: 'More...',
        items: [
          {
            id: 'subitem1',
            title: 'Subitem 1'
          },
          {
            id: 'item2',
            title: 'Subitem 2'
          }
        ]
      }
    ],
    onClick: function (item) {
      console.log('You have clicked:', item);
    }
});

  var openMenu = document.getElementById('menu');
  openMenu.onclick = function () {
    svgMenu.open();
  };

  var closeMenu = document.getElementById('close');
  closeMenu.onclick = function () {
    svgMenu.close();
  };
```

## Configuration

```json5
{
    closeOnClick: true, // boolean; will menu.close(), after item is selected. [default: true && menu.onClickFallback();]
    closeOnClickOutside: true, // true or function(); it will menu.close(), when item is not selected and click is outside of menu. [default: true]
    
    ui: { // ui customization
        fontSize: "38%", // text font-size of elements inside {menuContainer}, eg: text in {itemSector} [38%]
        classes: {
            menuContainer: "menuHolder", // whole radial-menu container, created dynamically! see: {params.parent}
            menuCreate: "menu",
            menuCreateParent: "inner", // main menu [{menuCreate} inner]
            menuCreateNested: "outer", // nested menu [{menuCreate} outer]
            menuOpen: "open", // menu is visible [open]
            menuClose: "close", // menu is not-visible [close]
            itemSectorActive: "sector", // item, which is active and can be selected [sector]
            itemSectorNested: "more", // item, which has nested items... [more]
            itemSectorDisabled: "dummy", // item, which is not-active/disabled [dummy]
            itemSelected: "selected", // item, which is selected [selected]
            closeBackButton: "center", // centered {close} or {back} button [centered]
            iconsContainer: "icons", // item's icon container [icons]
        },
        item: { // pre-defined items: {close} and {back} in similar way like: {menuItems}
            close: {title: "Close", icon: "#close"},
            back: {title: "Back", icon: "#return"},
            // FYI:
            // 1) if u want to change, eg: 'close' icon, just use item.close.icon = '#myIconId'
            // 2) if u want to override default 'icon' generation, see: RadialMenu.defaultValues.ui.item.{close, back}.symbol
            // 3) to change item's colors, etc use: CSS:
            //      svg.{menuCreate} > g.{itemSectorActive} > text,
            //      svg.{menuCreate} > g.{itemSectorActive} > use {...}
        },
        nested: { // nested ~ inner-menu behavior
            icon: "#return", // string(iconId:'#return') or true(for parentItem.icon)
            title: true // show nested title?
        },
        moveByWheel: true, // navigation by mouse-wheel. [default: true]
        moveByKeys: { // navigation by keys. [default: true]
            enabled: true,
            back: ["escape", "backspace"],
            select: ["enter"],
            forward: ["arrowRight", "arrowUp"],
            backward: ["arrowLeft", "arrowDown"]
        }
    }
}
```

## License

[MIT](LICENSE)

## Contributors

* [Alexey Nesterenko](https://github.com/axln)
* [Jan Smid](https://github.com/j3nda)
