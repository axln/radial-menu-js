'use strict';

/**
 * Radial menu in pure JavaScript, HTML and SVG.
 * License: MIT
 * Copyright (c) 2019 Alexey Nesterenko
 * -- https://github.com/axln/radial-menu-js
 * -- https://github.com/j3nda/radial-menu-js
 */
class RadialMenu
{
	static _defaultValues = {
		minSectors: 6,
		radius: {
			value: 50,
			multiInnerRadius: 0.4, // multiplication for default.radius.value [or params.radius]
			multiSectorSpace: 0.06 // multiplication for default.radius.value [or params.radius]
		},
		radiusInner: 0.4,
		radiusSectorSpace: 0.06,
		closeOnClick: true, // true or function(); will close(); after item is selected. [default: onClickFallback()]
		closeOnClickOutside: true, // true or function(); it will close(); when item is not selected and click is outside of menu. [default: true]
		ui: {
			fontSize: "38%", // text font-size of elements inside {menuContainer}, eg: text in {itemSector} [38%]
			classes: {
				menuContainer: "menuHolder", // whole radial-menu container, created dynamically! see: {params.parent}
				menuCreate: "menu",
				menuCreateParent: "inner", // main menu [{menuCreate} inner]
				menuCreateNested: "outer", // nested menu [{menuCreate} outer]
				menuOpen: "open", // menu is visible [open]
				menuClose: "close", // menu is not-visible [close]
				itemSectorActive: "sector", // item, which is active and can be selected
				itemSectorNested: "more", // item, which has nested items... [more]
				itemSectorDisabled: "dummy", // item, which is not-active/disabled [dummy]
				itemSelected: "selected", // item, which is selected [selected]
				closeBackButton: "center", // centered {close} or {back} button [centered]
				iconsContainer: "icons", // item's icon container [icons]
			},
			item: { // pre-defined items: {close} and {back} in similar way like: {menuItems}
				close: {
					title: "Close",
					icon: "#close",
					symbol: { // default icon fallback...
						id: "close",
						viewBox: "0 0 41.756 41.756",
						paths: [
							"M27.948,20.878L40.291,8.536c1.953-1.953,1.953-5.119,0-7.071c-1.951-1.952-5.119-1.952-7.07,0L20.878,13.809L8.535,1.465c-1.951-1.952-5.119-1.952-7.07,0c-1.953,1.953-1.953,5.119,0,7.071l12.342,12.342L1.465,33.22c-1.953,1.953-1.953,5.119,0,7.071C2.44,41.268,3.721,41.755,5,41.755c1.278,0,2.56-0.487,3.535-1.464l12.343-12.342l12.343,12.343c0.976,0.977,2.256,1.464,3.535,1.464s2.56-0.487,3.535-1.464c1.953-1.953,1.953-5.119,0-7.071L27.948,20.878z"
						]
					}
				},
				back: {
					title: "Back",
					icon: "#return",
					symbol: { // default icon fallback...
						id: "return",
						viewBox: "0 0 489.394 489.394",
						paths: [
							"M375.789,92.867H166.864l17.507-42.795c3.724-9.132,1-19.574-6.691-25.744c-7.701-6.166-18.538-6.508-26.639-0.879L9.574,121.71c-6.197,4.304-9.795,11.457-9.563,18.995c0.231,7.533,4.261,14.446,10.71,18.359l147.925,89.823c8.417,5.108,19.18,4.093,26.481-2.499c7.312-6.591,9.427-17.312,5.219-26.202l-19.443-41.132h204.886c15.119,0,27.418,12.536,27.418,27.654v149.852c0,15.118-12.299,27.19-27.418,27.19h-226.74c-20.226,0-36.623,16.396-36.623,36.622v12.942c0,20.228,16.397,36.624,36.623,36.624h226.74c62.642,0,113.604-50.732,113.604-113.379V206.709C489.395,144.062,438.431,92.867,375.789,92.867z"
						]
					}
				},
				// TODO: [ui/item] fontColor, textColor, ?position?
				// to change item's colors, etc use: CSS:
				// 		svg.{menuCreate} > g.{itemSectorActive} > text,
				// 		svg.{menuCreate} > g.{itemSectorActive} > use {...}
			},
			nested: {
				icon: "#return", // string(iconId:'#return') or true(for parentItem.icon)
				title: true, // show nested title?
				// TODO: [ui] ?it can show (number of nested menu)?
				// TODO: [ui] ?it can combine 'nested.icon' with '#return' icon ~ bestFitForSizes?
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

	/**
	 * create RadialMenu
	 * @param menuItems array of items, eg: [{id: "one", icon: "One"}, {id: "two", title: "two"}, {id: "more", icon: "more", title: "More...", items: [...]}]
	 * @param sizeInPixels
	 * @param params custom parameters to override {...}
	 */
	constructor(menuItems, sizeInPixels, params)
	{
		const defaultValues = this.merge({}, RadialMenu._defaultValues);

		this.defaultValues = defaultValues;
		this.uuid = this.generateUUID();
		this.parent = params.parent || document.body;
		this.size = sizeInPixels;
		this.menuItems = menuItems;
		this.radius = params.radius ? params.radius : defaultValues.radius.value;
		this.innerRadius = params.innerRadius
			? params.innerRadius
			: this.radius * (params.multiInnerRadius ? params.multiInnerRadius : defaultValues.radius.multiInnerRadius)
		;
		this.sectorSpace = params.sectorSpace
			? params.sectorSpace
			: this.radius * (params.multiSectorSpace ? params.multiSectorSpace : defaultValues.radius.multiSectorSpace)
		;
		this.sectorCount = Math.max(this.menuItems.length, defaultValues.minSectors);
		this.closeOnClick = params.closeOnClick !== undefined ? !!params.closeOnClick : defaultValues.closeOnClick;
		this.closeOnClickOutside = (params.closeOnClickOutside !== undefined
			? (params.closeOnClickOutside instanceof Function ? params.closeOnClickOutside : !!params.closeOnClickOutside)
			: defaultValues.closeOnClickOutside
		);
		this.onClick = params.onClick || this.onClickFallback;
		this.ui = this.merge(
			defaultValues.ui,
			params.ui || {}
		);
		this.scale = 1;

		// menu container ~ this.holder
		this.parent.appendChild(
			this.holder = this.createMenuContainer(
				this.uuid,
				this.size,
				[this.ui.classes.menuContainer, this.ui.classes.menuClose].join(' ')
			)
		);

		// default icons(close, back)
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', this.ui.classes.iconsContainer);
		svg.appendChild(this.createSvgSymbol(this.ui.item.close.symbol));
		svg.appendChild(this.createSvgSymbol(this.ui.item.back.symbol));
		this.holder.appendChild(svg);

		if (this.ui.moveByWheel)
		{
			document.addEventListener('wheel', this.onMouseWheel.bind(this));
		}
		if (this.ui.moveByKeys)
		{
			document.addEventListener('keydown', this.onKeyDown.bind(this));
		}

		this.initialize();
	}

	/**
	 * generate UUID
	 * -- https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
	 * -- https://stackoverflow.com/a/8809472/6130410
	 * @returns {string}
	 */
	generateUUID()
	{
		let d1 = new Date().getTime(); // timestamp
		let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; // time in microseconds since page-load or 0 if unsupported
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
			.replace(/[xy]/g, function(c)
			{
				let r = Math.random() * 16; // random number between 0 and 16
				if (d1 > 0)
				{
					// use timestamp until depleted
					r = (d1 + r) % 16 | 0;
					d1 = Math.floor(d1 / 16);
				}
				else
				{
					// use microseconds since page-load if supported
					r = (d2 + r) % 16 | 0;
					d2 = Math.floor(d2 / 16);
				}
				return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			})
		;
	}

	onClickFallback(item)
	{
		console.info(this.constructor.name + ".onClickFallback(item):");
		console.info(item);
		console.error(this.constructor.name + "onClick: function(item) {...}; // must be defined by params or default!");
	}

	/** return true if menu is visible, otherwise returns false. */
	isOpen()
	{
		return (this.currentMenu !== null);
	}

	/**
	 * handle mouse-click or tap, when its outside of menu.
	 * -- https://www.w3docs.com/snippets/javascript/how-to-detect-a-click-outside-an-element.html
	 */
	handleClickOutside(event, THIS)
	{
		const menu = document.getElementById(THIS.uuid);
		if (!menu || THIS.uuid !== menu.id || !THIS.isOpen())
		{
			return;
		}
		let target = event.target;
		do
		{
			if (target === menu)
			{
				// click inside! do nothing...
				return;
			}
			// go up thru DOM
			target = target.parentNode;
		}
		while (target);

		// click outside!
		if (THIS.closeOnClickOutside && THIS.closeOnClickOutside instanceof Function)
		{
			THIS.closeOnClickOutside(THIS);
		}
		THIS.close(true);
	}

	open(x = undefined, y = undefined)
	{
		if (this.isOpen())
		{
			return;
		}
		this.initialize();
		this.currentMenu = this.createMenu(
			[this.ui.classes.menuCreate, this.ui.classes.menuCreateParent].join(' '),
			this.menuItems
		);

		const alreadyOpened = this.holder.getElementsByClassName(this.ui.classes.menuCreate);
		if (alreadyOpened)
		{
			// alreadyOpened? remove all... to start from scratch!
			while(alreadyOpened.length > 0)
			{
				alreadyOpened[0].parentNode.removeChild(alreadyOpened[0]);
			}
		}
		this.holder.appendChild(this.currentMenu);

		// wait DOM commands to apply and then set class to allow transition to take effect
		const THIS = this;
		this.postRunnable(function()
		{
			THIS.currentMenu.setAttribute(
				'class',
				[THIS.ui.classes.menuCreate, THIS.ui.classes.menuOpen].join(' ')
			);
			if (THIS.closeOnClickOutside)
			{
				document.addEventListener('click', THIS.closeOnClickOutsideListener = function(event)
				{
					THIS.handleClickOutside(event, THIS);
				});
			}
		});
		const menuContainer = document.getElementById(this.uuid);
		menuContainer.classList.remove(this.ui.classes.menuClose);
		menuContainer.classList.add(this.ui.classes.menuOpen);
		if (x !== undefined)
		{
			menuContainer.style.left = (x - this.size / 2) + "px";
		}
		if (y !== undefined)
		{
			menuContainer.style.top = (y - this.size / 2) + "px";
		}
	}

	close(force = false)
	{
		if (!force && !this.isOpen())
		{
			return;
		}
		const THIS = this;
		if (this.currentMenu !== null)
		{
			this.setClassAndWaitForTransition(
				this.currentMenu,
				[this.ui.classes.menuCreate, this.ui.classes.menuCreateParent].join(' ')
			)
			.then(function ()
			{
				THIS.initialize();
			});
		}
		if (this.closeOnClickOutside)
		{
			document.removeEventListener('click', this.closeOnClickOutsideListener);
		}
		this.postRunnable(function()
		{
			THIS.initialize();
		}, 250);
	}

	initialize()
	{
		this.level = 0;
		this.currentMenu = null;
		this.levelItems = null;
		this.parentMenu = [];
		this.parentItems = [];
		const alreadyOpened = this.holder.getElementsByClassName(this.ui.classes.menuCreate);
		if (alreadyOpened)
		{
			// alreadyOpened? remove all... to start from scratch!
			while(alreadyOpened.length > 0)
			{
				alreadyOpened[0].parentNode.removeChild(alreadyOpened[0]);
			}
		}
		const menuContainer = document.getElementById(this.uuid);
		if (menuContainer)
		{
			menuContainer.classList.remove(this.ui.classes.menuOpen);
			menuContainer.classList.add(this.ui.classes.menuClose);
		}
	}

	/** default functionality as onClick(): function(), which MUST be overridden through params! */
	onClick(item)
	{
		return item;
	}

	getParentMenu()
	{
		if (this.parentMenu.length > 0)
		{
			return this.parentMenu[this.parentMenu.length - 1];
		}
		return null;
	}

	createMenuContainer(uuid, size, classValue)
	{
		const container = document.createElement('div');

		container.id = uuid;
		container.className = classValue;
		container.style.width = size + 'px';
		container.style.height = size + 'px';

		return container;
	}

	showNestedMenu(item)
	{
		if (!this.isOpen())
		{
			return;
		}
		this.level++;
		this.parentMenu.push(this.currentMenu);
		this.parentItems.push(this.levelItems);
		this.currentMenu = this.createMenu(
			[this.ui.classes.menuCreate, this.ui.classes.menuCreateParent].join(' '),
			item.items,
			item
		);
		this.holder.appendChild(this.currentMenu);

		// wait DOM commands to apply and then set class to allow transition to take effect
		const THIS = this;
		this.postRunnable(function()
		{
			if (!THIS.isOpen())
			{
				return;
			}
			THIS.getParentMenu().setAttribute(
				'class',
				[THIS.ui.classes.menuCreate, THIS.ui.classes.menuCreateNested, THIS.ui.classes.menuClose].join(' ')
			);
			THIS.currentMenu.setAttribute(
				'class',
				[THIS.ui.classes.menuCreate, THIS.ui.classes.menuOpen].join(' ')
			);
		});
	}

	returnToParentMenu()
	{
		this.getParentMenu().setAttribute(
			'class',
			[this.ui.classes.menuCreate, this.ui.classes.menuOpen].join(' ')
		);
		const THIS = this;
		this.setClassAndWaitForTransition(
				this.currentMenu,
				[this.ui.classes.menuCreate, this.ui.classes.menuCreateParent].join(' ')
			)
			.then(function(){
				THIS.currentMenu.remove();
				THIS.currentMenu = THIS.parentMenu.pop();
				THIS.levelItems = THIS.parentItems.pop();
				THIS.currentMenu.setAttribute(
					'class',
					[THIS.ui.classes.menuCreate, THIS.ui.classes.menuOpen].join(' ')
				);
			})
		;
	}

	/** handle click inside menu, eg: choosing item. */
	handleClick()
	{
		if (!this.isOpen())
		{
			return;
		}
		const selectedIndex = this.getSelectedIndex();
		if (selectedIndex >= 0)
		{
			const item = this.levelItems[selectedIndex];
			if (item.items)
			{
				this.showNestedMenu(item);
				return;
			}
			let selectedItem = Object.assign({}, item);
			if (this.closeOnClick)
			{
				this.close(true);
			}
			if (this.onClick && this.onClick instanceof Function)
			{
				this.onClick(selectedItem);
				return;
			}
			this.onClickFallback(selectedItem);
		}
	}

	/** handle click in the center, eg: close or back-button */
	handleClickCloseOrBack()
	{
		if (!this.isOpen())
		{
			return;
		}
		if (this.parentItems.length > 0)
		{
			this.returnToParentMenu();
			return;
		}
		this.close(true);
	}

	/**
	 * create center button, eg: close or back-button
	 * @param item as {title: watawaka, icon: matafaka, etc...}
	 * @param size
	 * @param nested am i nested? yes, here is my parentItem
	 */
	createCloseBackButton(item, size, nested = undefined)
	{
		size = size || 8;//TODO:?magicNumber?default value?8?

		const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		group.setAttribute('class', this.ui.classes.closeBackButton);

		const centerCircle = this.createSvgCircle(0, 0, this.innerRadius - this.sectorSpace / 3);
		group.appendChild(centerCircle);

		if (nested && this.ui.nested.title)
		{
			const text = this.createSvgText(0, +size, nested);
			group.appendChild(text);
		}

		if (item.icon)
		{
			let icon = item.icon;
			if (nested && this.ui.nested.icon)
			{
				icon = (this.ui.nested.icon === true ? nested.icon : this.ui.nested.icon);
			}
			const use = this.createSvgUse(0, 0, icon);
			use.setAttribute('width', size);
			use.setAttribute('height', size);
			use.setAttribute(
				'transform',
				'translate(-' + this.numberToString(size / 2) + ',-' + this.numberToString(size / 2) + ')'
			);
			group.appendChild(use);
		}
		return group;
	}

	getIndexOffset()
	{
		if (this.levelItems.length < this.sectorCount)
		{
			switch (this.levelItems.length)
			{
				case 1:
				case 2:
				case 3:
					return -2;

				default:
					return -1;
			}
		}
		return -1;
	}

	/** create all items for currently visible menu, eg: main menu or nested one */
	createMenu(classValue, levelItems, nested)
	{
		this.levelItems = levelItems;
		this.sectorCount = Math.max(this.levelItems.length, this.defaultValues.minSectors);
		this.scale = this.calculateScale();

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', classValue);
		svg.setAttribute('viewBox', '-50 -50 100 100');
		svg.setAttribute('width', this.size);
		svg.setAttribute('height', this.size);

		const angleStep = 360 / this.sectorCount;
		const angleShift = angleStep / 2 + 270;
		const indexOffset = this.getIndexOffset();

		for (let i = 0; i < this.sectorCount; ++i)
		{
			const startAngle = angleShift + angleStep * i;
			const endAngle = angleShift + angleStep * (i + 1);
			const itemIndex = this.resolveLoopIndex(this.sectorCount - i + indexOffset, this.sectorCount);
			let item = null;
			if (itemIndex >= 0 && itemIndex < this.levelItems.length)
			{
				item = this.levelItems[itemIndex];
			}
			svg.appendChild(
				this.createItemSector(startAngle, endAngle, item, itemIndex)
			);
		}

		if (nested)
		{
			svg.appendChild(
				this.createCloseBackButton(this.ui.item.back, 8, nested)//TODO:??magicNumber?8?
			);
		}
		else
		{
			svg.appendChild(
				this.createCloseBackButton(this.ui.item.close, 7)//TODO:??magicNumber?7?
			);
		}

		const THIS = this;
		svg.addEventListener('mousedown', function(event)
		{
			const classNames = event.target.parentNode.getAttribute('class').split(' ');
			for (let i = 0; i < classNames.length; i++)
			{
				if (classNames[i] === THIS.ui.classes.itemSectorActive)
				{
					const index = parseInt(event.target.parentNode.getAttribute('data-index'));
					if (!isNaN(index))
					{
						THIS.setSelectedIndex(index);
					}
					break;
				}
			}
		});
		svg.addEventListener('click', function(event)
		{
			const classNames = event.target.parentNode.getAttribute('class').split(' ');
			for (let i = 0; i < classNames.length; i++)
			{
				if (classNames[i] === THIS.ui.classes.itemSectorActive)
				{
					THIS.handleClick();
					break;
				}
				if (classNames[i] === THIS.ui.classes.closeBackButton)
				{
					THIS.handleClickCloseOrBack();
					break;
				}
			}
		});
		return svg;
	}

	/** setSelectedIndex() based on +/- indexDelta, eg: onMouseWheel */
	selectDelta(indexDelta)
	{
		let selectedIndex = this.getSelectedIndex();
		if (selectedIndex < 0)
		{
			selectedIndex = 0;
		}
		selectedIndex += indexDelta;
		if (selectedIndex < 0)
		{
			selectedIndex = this.levelItems.length + selectedIndex;
		}
		else
		if (selectedIndex >= this.levelItems.length)
		{
			selectedIndex -= this.levelItems.length;
		}
		this.setSelectedIndex(selectedIndex);
	};

	onKeyDown(event)
	{
		if (!this.isOpen())
		{
			return;
		}
		if (this.isKeyDown(event, this.ui.moveByKeys.back))
		{
			this.handleClickCloseOrBack();
			event.preventDefault();
			return;
		}
		if (this.isKeyDown(event, this.ui.moveByKeys.select))
		{
			this.handleClick();
			event.preventDefault();
			return;
		}
		if (this.isKeyDown(event, this.ui.moveByKeys.forward))
		{
			this.selectDelta(+1);
			event.preventDefault();
			return;
		}
		if (this.isKeyDown(event, this.ui.moveByKeys.backward))
		{
			this.selectDelta(-1);
			event.preventDefault();
			return;
		}
	}

	isKeyDown(event, keySet)
	{
		const keyId = event.key.toLowerCase();
		for(let i = 0; i < keySet.length; i++)
		{
			if (keyId === keySet[i].toLowerCase())
			{
				return true;
			}
		}
		return false;
	}

	onMouseWheel(event)
	{
		if (!this.isOpen())
		{
			return;
		}
		const delta = -event.deltaY;
		this.selectDelta(delta > 0 ? +1 : -1);
	}

	getSelectedNode()
	{
		const items = this.currentMenu.getElementsByClassName(this.ui.classes.itemSelected);
		if (items.length > 0)
		{
			return items[0];
		}
		return null;
	}

	getSelectedIndex()
	{
		const selectedNode = this.getSelectedNode();
		if (selectedNode)
		{
			return parseInt(selectedNode.getAttribute('data-index'));
		}
		return -1;
	}

	setSelectedIndex(index)
	{
		if (index >= 0 && index < this.levelItems.length)
		{
			const items = this.currentMenu.querySelectorAll('g[data-index="' + index + '"]');
			if (items.length > 0)
			{
				const itemToSelect = items[0];
				const selectedNode = this.getSelectedNode();
				let itemClasses = [this.ui.classes.itemSectorActive, this.ui.classes.itemSelected];
				if (selectedNode)
				{
					selectedNode.setAttribute('class', this.ui.classes.itemSectorActive);
				}
				if (itemToSelect.items && itemToSelect.items.length > 0)
				{
					itemClasses.push(this.ui.classes.itemSectorNested);
				}
				itemToSelect.setAttribute('class', itemClasses.join(' '));
			}
		}
	}

	createSvgUse(x, y, link)
	{
		const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

		use.setAttribute('x', this.numberToString(x));
		use.setAttribute('y', this.numberToString(y));
		use.setAttribute('width', '10');//TODO:??magicNumber?10?
		use.setAttribute('height', '10');//TODO:??magicNumber?10?
		use.setAttribute('fill', 'white');//TODO:??magicNumber?color?
		use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', link);

		return use;
	}

	createItemSector(startAngleDeg, endAngleDeg, item, index)
	{
		const centerPoint = this.getSectorPosition(startAngleDeg, endAngleDeg);
		const translate = {
			x: this.numberToString((1 - this.scale) * centerPoint.x),
			y: this.numberToString((1 - this.scale) * centerPoint.y),
		};

		const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		group.setAttribute('transform', 'translate(' + translate.x + ' ,' + translate.y + ') scale(' + this.scale + ')');

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', this.createItemSectorPath(startAngleDeg, endAngleDeg));
		group.appendChild(path);

		if (item)
		{
			let itemClasses = [this.ui.classes.itemSectorActive];
			if (item.selected && item.selected === true)
			{
				itemClasses.push(this.ui.classes.itemSelected);
			}
			if (item.items && item.items.length > 0)
			{
				itemClasses.push(this.ui.classes.itemSectorNested);
			}
			group.setAttribute('class', itemClasses.join(' '));
			group.setAttribute('data-id', item.id);
			group.setAttribute('data-index', index);

			if (item.title)
			{
				const text = this.createSvgText(centerPoint.x, centerPoint.y, item);
				if (item.icon)
				{
					text.setAttribute('transform', 'translate(0,8)');
				}
				else
				{
					text.setAttribute('transform', 'translate(0,2)');
				}
				group.appendChild(text);
			}

			if (item.icon)
			{
				const use = this.createSvgUse(centerPoint.x, centerPoint.y, item.icon);
				if (item.title)
				{
					use.setAttribute('transform', 'translate(-5,-8)');
				}
				else
				{
					use.setAttribute('transform', 'translate(-5,-5)');
				}
				group.appendChild(use);
			}
		}
		else
		{
			group.setAttribute('class', this.ui.classes.itemSectorDisabled);
		}
		return group;
	};

	createItemSectorPath(startAngleDeg, endAngleDeg)
	{
		// FIXME: if (this.minSectors < 4) it looks weird! itemSectorPath is somehow deformed!
		// TODO: createItemSectorPath(more params, regards to created item, eg: {start, end}Angle...);
		const initPoint = this.getDegreePosition(startAngleDeg, this.radius);
		let path = 'M' + this.pointToString(initPoint);
		const radiusAfterScale = this.radius * (1 / this.scale);

		path += 'A' + radiusAfterScale + ' ' + radiusAfterScale + ' 0 0 0' + this.pointToString(this.getDegreePosition(endAngleDeg, this.radius));
		path += 'L' + this.pointToString(this.getDegreePosition(endAngleDeg, this.innerRadius));

		const radiusDiff = this.radius - this.innerRadius;
		const radiusDelta = (radiusDiff - (radiusDiff * this.scale)) / 2;
		const innerRadius = (this.innerRadius + radiusDelta) * (1 / this.scale);

		path += 'A' + innerRadius + ' ' + innerRadius + ' 0 0 1 ' + this.pointToString(this.getDegreePosition(startAngleDeg, this.innerRadius));
		path += 'Z';

		return path;
	}

	createSvgText(x, y, item)
	{
		const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('x', this.numberToString(x));
		text.setAttribute('y', this.numberToString(y));
		text.setAttribute('font-size', item.fontSize ?? this.ui.fontSize);
		text.innerHTML = item.title;

		return text;
	}

	createSvgCircle(x, y, r)
	{
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

		circle.setAttribute('cx', this.numberToString(x));
		circle.setAttribute('cy', this.numberToString(y));
		circle.setAttribute('r', r);

		return circle;
	};

	calculateScale()
	{
		const totalSpace = this.sectorSpace * this.sectorCount;
		const circleLength = Math.PI * 2 * this.radius;
		const radiusDelta = this.radius - (circleLength - totalSpace) / (Math.PI * 2);

		return (this.radius - radiusDelta) / this.radius;
	}

	getSectorPosition(startAngleDeg, endAngleDeg)
	{
		return this.getDegreePosition(
			(startAngleDeg + endAngleDeg) / 2,
			this.innerRadius + (this.radius - this.innerRadius) / 2
		);
	}

	createSvgSymbol(item)
	{
		const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
		symbol.setAttribute('id', item.id);
		symbol.setAttribute('viewBox', item.viewBox);

		for(let i = 0; i < item.paths.length; i++)
		{
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', item.paths[i]);
			symbol.appendChild(path);
		}
		return symbol;
	}

	getDegreePosition(angleDeg, length)
	{
		return {
			x: Math.sin(this.degToRad(angleDeg)) * length,
			y: Math.cos(this.degToRad(angleDeg)) * length
		};
	}

	pointToString(point)
	{
		return this.numberToString(point.x) + ' ' + this.numberToString(point.y);
	}

	numberToString(n)
	{
		if (Number.isInteger(n))
		{
			return n.toString();
		}
		else
		if (n)
		{
			let r = (+n).toFixed(5);
			if (r.match(/\./))
			{
				r = r.replace(/\.?0+$/, '');
			}
			return r;
		}
		return "";
	}

	resolveLoopIndex(index, length)
	{
		if (index < 0)
		{
			return length + index;
		}
		if (index >= length)
		{
			return index - length;
		}
		if (index < length)
		{
			return index;
		}
		return null;
	}

	degToRad(deg)
	{
		return deg * (Math.PI / 180);
	}

	setClassAndWaitForTransition(node, newClass)
	{
		return new Promise(function(resolve)
		{
			function handler(event)
			{
				if (event.target === node && event.propertyName === 'visibility')
				{
					node.removeEventListener('transitionend', handler);
					resolve();
				}
			}
			node.addEventListener('transitionend', handler);
			node.setAttribute('class', newClass);
		});
	}

	/**
	 * well, well, well naaacelniku :P
	 * this will process function(); its very useful to be sure that data will be processed exactly same!
	 * (basically u want to encapsulate data-manipulation due transitions-shlitz, eg: setClassAndWaitForTransition())
	 */
	postRunnable(fn, timeoutMs = 10)
	{
		setTimeout(fn, timeoutMs);
	}

	/**
	 * return true if its object, otherwise returns false.
	 * (part of merge() functionality)
	 */
	isObject(item)
	{
		return (item && typeof item === 'object' && !Array.isArray(item));
	}

	/**
	 * Deep merge two objects.
	 * -- https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge?page=1&tab=scoredesc#tab-top
	 * @param target
	 * @param sources
	 */
	merge(target, ...sources)
	{
		if (!sources.length)
		{
			return target;
		}
		const source = sources.shift();
		if (this.isObject(target) && this.isObject(source))
		{
			for (const key in source)
			{
				if (this.isObject(source[key]))
				{
					if (!target[key])
					{
						Object.assign(target, {[key]: {}});
					}
					this.merge(target[key], source[key]);
				}
				else
				{
					Object.assign(target, { [key]: source[key] });
				}
			}
		}
		return this.merge(target, ...sources);
	}
}
