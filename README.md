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

```json
{
    closeOnClick: true, // boolean; will menu.close(), after item is selected. [default: true && menu.onClickFallback();]
    closeOnClickOutside: true, // true or function(); it will menu.close(), when item is not selected and click is outside of menu. [default: true]

    nested: { // nested ~ inner-menu behavior
		icon: "#return", // string(iconName:'#return') or true(for parentItem.icon)
		title: true // show nested title?
	}
}
```

## License
MIT

## Contributors

* [Alexey Nesterenko](https://github.com/axln) 
* [Jan Smid](https://github.com/j3nda)
