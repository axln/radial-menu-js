'use strict';

/**
 * Radial menu in pure JavaScript, HTML and SVG
 * License: MIT
 * -- https://github.com/axln/radial-menu-js
 * -- https://github.com/j3nda/radial-menu-js
 */
class RadialMenu
{
	static _defaultValues = {
		size: 100, // aka DEFAULT_SIZE
		minSectors: 6, // aka MIN_SECTORS
		radius: {
			value: 50,
			multiInnerRadius: 0.4, // multiplication for default.radius.value [or params.radius]
			multiSectorSpace: 0.06 // multiplication for default.radius.value [or params.radius]
		},
		radiusInner: 0.4,
		radiusSectorSpace: 0.06,
		closeOnClick: true, // true or function(); will close(); after item is selected. [default: onClickFallback()]
		closeOnClickOutside: true, // true or function(); it will close(); when item is not selected and click is outside of menu. [default: true]
		nested: {
			icon: "#return", // string(iconName:'#return') or true(for parentItem.icon)
			title: true, // show nested title?
			//TODO:?it can show (number of nested menu)?
			//TODO:?it can combine 'nested.icon' with '#return' icon ~ bestFitForSizes?
		}
	}

	constructor(params)
	{
		const THIS = this;
		const defaultValues = this.defaultValues = RadialMenu._defaultValues;
		this.uuid = this.generateUUID();
		this.parent = params.parent || [];//TODO: refactor: ?this.attr = this.merge(defaultValues, params);?

		this.size = params.size || defaultValues.size;
		this.onClick = params.onClick || function(item)
		{
			THIS.onClickFallback(item);
		};
		this.menuItems = params.menuItems ? params.menuItems : [{id: 'one', title: 'One'}, {id: 'two', title: 'Two'}];

		this.radius = params.radius ? params.radius : defaultValues.radius.value;
		this.innerRadius = params.innerRadius ? params.innerRadius : this.radius * defaultValues.radius.multiInnerRadius;
		this.sectorSpace = params.sectorSpace ? params.sectorSpace : this.radius * defaultValues.radius.multiSectorSpace;
		this.sectorCount = Math.max(this.menuItems.length, defaultValues.minSectors);
		this.closeOnClick = (params.closeOnClick !== undefined
			? !!params.closeOnClick
			: defaultValues.closeOnClick
		);
		this.closeOnClickOutside = (params.closeOnClickOutside !== undefined
			? !!params.closeOnClickOutside
			: defaultValues.closeOnClickOutside
		);
		this.nested = this.merge(
			defaultValues.nested,
			(params.nested ? params.nested : {})
		);
		this.scale = 1;//TODO:?ma smysl mit jiny scale?
		this.holder = null;
		this.parentMenu = [];
		this.parentItems = [];
		this.levelItems = null;

		this.createHolder();//TODO:?multiple menuHolder?
		this.addIconSymbols();//TODO:?iconSymbolsFactory?

		this.currentMenu = null;
		document.addEventListener('wheel', this.onMouseWheel.bind(this));//TODO:?enable/disable?
		document.addEventListener('keydown', this.onKeyDown.bind(this));//TODO:?enable/disable?
	}

	generateUUID()
	{
		// -- https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
		// License: Public Domain / MIT
		let d1 = new Date().getTime();//Timestamp
		let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; // Time in microseconds since page-load or 0 if unsupported
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
			.replace(/[xy]/g, function(c)
			{
				let r = Math.random() * 16; // random number between 0 and 16
				if (d1 > 0)
				{
					// Use timestamp until depleted
					r = (d1 + r) % 16 | 0;
					d1 = Math.floor(d1 / 16);
				}
				else
				{
					// Use microseconds since page-load if supported
					r = (d2 + r) % 16 | 0;
					d2 = Math.floor(d2 / 16);
				}
				return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			})
		;
	}

	onClickFallback(item)
	{
		console.warn('function onClick(item): is not defined by params! default!');
		console.info(this.constructor.name + ".onClick()");
		console.info(item);
	}

	isOpen()
	{
		return (this.currentMenu !== null);
	}

	onClickOutside(event, THIS)
	{
		const menu = document.getElementById(THIS.uuid);
		if (!menu)
		{
			return;
		}
		let target = event.target;
		do
		{
			if (target == menu)
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
		THIS.close();
	}

	open()
	{
		if (this.isOpen())
		{
			return;
		}
		this.currentMenu = this.createMenu('menu inner', this.menuItems);
		this.holder.appendChild(this.currentMenu);

		// wait DOM commands to apply and then set class to allow transition to take effect
		const THIS = this;
		this.nextTick(function()
		{
			THIS.currentMenu.setAttribute('class', 'menu');
			if (THIS.closeOnClickOutside)
			{
				document.addEventListener('click', THIS.closeOnClickOutsideListener = function(event)
				{
					THIS.onClickOutside(event, THIS);
				});
			}
		});
	}

	close()
	{
		if (!this.isOpen())
		{
			return;
		}
		let parentMenu;
		while (parentMenu = this.parentMenu.pop())
		{
			parentMenu.remove();
		}
		this.parentItems = [];

		const THIS = this;
		this.setClassAndWaitForTransition(this.currentMenu, 'menu inner')
			.then(function()
			{
				if (THIS.currentMenu !== null)
				{
					THIS.currentMenu.remove();
				}
				THIS.currentMenu = null;
				if (THIS.closeOnClickOutside)
				{
					document.removeEventListener('click', THIS.closeOnClickOutsideListener);
				}
			})
		;
	}

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

	createHolder()
	{
		this.holder = document.createElement('div');
		this.holder.id = this.uuid;
		this.holder.className = 'menuHolder';
		this.holder.style.width = this.size + 'px';
		this.holder.style.height = this.size + 'px';

		this.parent.appendChild(this.holder);
	}

	showNestedMenu(item)
	{
		this.parentMenu.push(this.currentMenu);
		this.parentItems.push(this.levelItems);
		this.currentMenu = this.createMenu('menu inner', item.items, item);
		this.holder.appendChild(this.currentMenu);

		// wait DOM commands to apply and then set class to allow transition to take effect
		const THIS = this;
		this.nextTick(function()
		{
			THIS.getParentMenu().setAttribute('class', 'menu outer');
			THIS.currentMenu.setAttribute('class', 'menu');
		});
	}

	returnToParentMenu()
	{
		this.getParentMenu().setAttribute('class', 'menu');

		const THIS = this;
		this.setClassAndWaitForTransition(this.currentMenu, 'menu inner')
			.then(function()
			{
				THIS.currentMenu.remove();
				THIS.currentMenu = THIS.parentMenu.pop();
				THIS.levelItems = THIS.parentItems.pop();
			})
		;
	}

	handleClick()
	{
		const selectedIndex = this.getSelectedIndex();
		if (selectedIndex >= 0)
		{
			const item = this.levelItems[selectedIndex];
			if (item.items)
			{
				this.showNestedMenu(item);
			}
			else
			if (this.onClick)
			{
				this.onClick(item);
				if (this.closeOnClick)
				{
					this.close();
				}
			}
		}
	}

	handleCenterClick()
	{
		if (this.parentItems.length > 0)
		{
			this.returnToParentMenu();
		}
		else
		{
			this.close();
		}
	}

	createCenter(svg, title, icon, size, nested = null)
	{
		size = size || 8;//TODO:?magicNumber?default value?

		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.setAttribute('class', 'center');

		const centerCircle = this.createCircle(0, 0, this.innerRadius - this.sectorSpace / 3);
		g.appendChild(centerCircle);

		if (nested && this.nested.title)
		{
			const text = this.createText(0, +size, nested.title);
			g.appendChild(text);
		}

		if (icon)
		{
			if (nested && this.nested.icon)
			{
				icon = (this.nested.icon === true ? nested.icon : this.nested.icon);
			}
			const use = this.createUseTag(0, 0, icon);
			use.setAttribute('width', size);
			use.setAttribute('height', size);
			use.setAttribute('transform', 'translate(-' + this.numberToString(size / 2) + ',-' + this.numberToString(size / 2) + ')');
			g.appendChild(use);
		}
		svg.appendChild(g);
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

	createMenu(classValue, levelItems, nested)
	{
		const THIS = this;
		this.levelItems = levelItems;

		this.sectorCount = Math.max(this.levelItems.length, this.defaultValues.minSectors);
		this.scale = this.calcScale();

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
			this.appendSectorPath(startAngle, endAngle, svg, item, itemIndex);
		}

		if (nested)
		{
			this.createCenter(svg, 'Back', '#return', 8, nested); //TODO:??magicNumber??
		}
		else
		{
			this.createCenter(svg, 'Close', '#close', 7);//TODO:??magicNumber??
		}

		svg.addEventListener('mousedown', function(event)
		{
			const className = event.target.parentNode.getAttribute('class').split(' ')[0];
			switch (className)
			{
				case 'sector':
				{
					const index = parseInt(event.target.parentNode.getAttribute('data-index'));
					if (!isNaN(index))
					{
						THIS.setSelectedIndex(index);
					}
					break;
				}
				default:
					break;
			}
		});
		svg.addEventListener('click', function(event)
		{
			const className = event.target.parentNode.getAttribute('class').split(' ')[0];
			switch (className)
			{
				case 'sector':
				{
					THIS.handleClick();
					break;
				}
				case 'center':
				{
					THIS.handleCenterClick();
					break;
				}
				default:
					break;
			}
		});
		return svg;
	}

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
		switch (event.key)
		{
			case 'Escape':
			case 'Backspace':
			{
				this.handleCenterClick();
				event.preventDefault();
				break;
			}
			case 'Enter':
			{
				this.handleClick();
				event.preventDefault();
				break;
			}
			case 'ArrowRight':
			case 'ArrowUp':
			{
				this.selectDelta(1);
				event.preventDefault();
				break;
			}
			case 'ArrowLeft':
			case 'ArrowDown':
			{
				this.selectDelta(-1);
				event.preventDefault();
				break;
			}
			default:
				break;
		}
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
		const items = this.currentMenu.getElementsByClassName('selected');
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
				if (selectedNode)
				{
					selectedNode.setAttribute('class', 'sector');
				}
				itemToSelect.setAttribute('class', 'sector selected');
			}
		}
	}

	createUseTag(x, y, link)
	{
		const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

		use.setAttribute('x', this.numberToString(x));
		use.setAttribute('y', this.numberToString(y));
		use.setAttribute('width', '10');
		use.setAttribute('height', '10');
		use.setAttribute('fill', 'white');
		use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', link);

		return use;
	}

	appendSectorPath(startAngleDeg, endAngleDeg, svg, item, index)
	{
		const centerPoint = this.getSectorCenter(startAngleDeg, endAngleDeg);
		const translate = {
			x: this.numberToString((1 - this.scale) * centerPoint.x),
			y: this.numberToString((1 - this.scale) * centerPoint.y),
		};

		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.setAttribute('transform', 'translate(' + translate.x + ' ,' + translate.y + ') scale(' + this.scale + ')');

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', this.createSectorCmds(startAngleDeg, endAngleDeg));
		g.appendChild(path);

		if (item)
		{
			g.setAttribute('class', 'sector');
			if (index === 0)
			{
				g.setAttribute('class', 'sector selected');
			}
			g.setAttribute('data-id', item.id);
			g.setAttribute('data-index', index);

			if (item.title)
			{
				const text = this.createText(centerPoint.x, centerPoint.y, item.title);
				if (item.icon)
				{
					text.setAttribute('transform', 'translate(0,8)');
				}
				else
				{
					text.setAttribute('transform', 'translate(0,2)');
				}
				g.appendChild(text);
			}

			if (item.icon)
			{
				const use = this.createUseTag(centerPoint.x, centerPoint.y, item.icon);
				if (item.title)
				{
					use.setAttribute('transform', 'translate(-5,-8)');
				}
				else
				{
					use.setAttribute('transform', 'translate(-5,-5)');
				}
				g.appendChild(use);
			}

		}
		else
		{
			g.setAttribute('class', 'dummy');
		}
		svg.appendChild(g);
	};

	createSectorCmds(startAngleDeg, endAngleDeg)
	{
		const initPoint = this.getDegreePos(startAngleDeg, this.radius);
		let path = 'M' + this.pointToString(initPoint);
		const radiusAfterScale = this.radius * (1 / this.scale);

		path += 'A' + radiusAfterScale + ' ' + radiusAfterScale + ' 0 0 0' + this.pointToString(this.getDegreePos(endAngleDeg, this.radius));
		path += 'L' + this.pointToString(this.getDegreePos(endAngleDeg, this.innerRadius));

		const radiusDiff = this.radius - this.innerRadius;
		const radiusDelta = (radiusDiff - (radiusDiff * this.scale)) / 2;
		const innerRadius = (this.innerRadius + radiusDelta) * (1 / this.scale);

		path += 'A' + innerRadius + ' ' + innerRadius + ' 0 0 1 ' + this.pointToString(this.getDegreePos(startAngleDeg, this.innerRadius));
		path += 'Z';

		return path;
	}

	createText(x, y, title)
	{
		const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('x', this.numberToString(x));
		text.setAttribute('y', this.numberToString(y));
		text.setAttribute('font-size', '38%');//TODO:?fontSize?
		text.innerHTML = title;

		return text;
	}

	createCircle(x, y, r)
	{
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

		circle.setAttribute('cx', this.numberToString(x));
		circle.setAttribute('cy', this.numberToString(y));
		circle.setAttribute('r', r);

		return circle;
	};

	calcScale()
	{
		const totalSpace = this.sectorSpace * this.sectorCount;
		const circleLength = Math.PI * 2 * this.radius;
		const radiusDelta = this.radius - (circleLength - totalSpace) / (Math.PI * 2);

		return (this.radius - radiusDelta) / this.radius;
	}

	getSectorCenter(startAngleDeg, endAngleDeg)
	{
		return this.getDegreePos(
			(startAngleDeg + endAngleDeg) / 2,
			this.innerRadius + (this.radius - this.innerRadius) / 2
		);
	}

	addIconSymbols()
	{
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'icons');

		// return
		const returnSymbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
		returnSymbol.setAttribute('id', 'return');
		returnSymbol.setAttribute('viewBox', '0 0 489.394 489.394');

		const returnPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		returnPath.setAttribute('d', "M375.789,92.867H166.864l17.507-42.795c3.724-9.132,1-19.574-6.691-25.744c-7.701-6.166-18.538-6.508-26.639-0.879" +
			"L9.574,121.71c-6.197,4.304-9.795,11.457-9.563,18.995c0.231,7.533,4.261,14.446,10.71,18.359l147.925,89.823" +
			"c8.417,5.108,19.18,4.093,26.481-2.499c7.312-6.591,9.427-17.312,5.219-26.202l-19.443-41.132h204.886" +
			"c15.119,0,27.418,12.536,27.418,27.654v149.852c0,15.118-12.299,27.19-27.418,27.19h-226.74c-20.226,0-36.623,16.396-36.623,36.622" +
			"v12.942c0,20.228,16.397,36.624,36.623,36.624h226.74c62.642,0,113.604-50.732,113.604-113.379V206.709" +
			"C489.395,144.062,438.431,92.867,375.789,92.867z");

		returnSymbol.appendChild(returnPath);
		svg.appendChild(returnSymbol);

		// close
		const closeSymbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
		closeSymbol.setAttribute('id', 'close');
		closeSymbol.setAttribute('viewBox', '0 0 41.756 41.756');

		const closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		closePath.setAttribute('d', "M27.948,20.878L40.291,8.536c1.953-1.953,1.953-5.119,0-7.071c-1.951-1.952-5.119-1.952-7.07,0L20.878,13.809L8.535,1.465" +
			"c-1.951-1.952-5.119-1.952-7.07,0c-1.953,1.953-1.953,5.119,0,7.071l12.342,12.342L1.465,33.22c-1.953,1.953-1.953,5.119,0,7.071" +
			"C2.44,41.268,3.721,41.755,5,41.755c1.278,0,2.56-0.487,3.535-1.464l12.343-12.342l12.343,12.343" +
			"c0.976,0.977,2.256,1.464,3.535,1.464s2.56-0.487,3.535-1.464c1.953-1.953,1.953-5.119,0-7.071L27.948,20.878z");
		closeSymbol.appendChild(closePath);

		svg.appendChild(closeSymbol);
		this.holder.appendChild(svg);
	}

	getDegreePos(angleDeg, length)
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
			let r = (+n).toFixed(5);//TODO:?magicNumber?
			if (r.match(/\./))
			{
				r = r.replace(/\.?0+$/, '');
			}
			return r;
		}
		// TODO:?if is NaN? what to do?
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
				if (event.target == node && event.propertyName == 'visibility')
				{
					node.removeEventListener('transitionend', handler);
					resolve();
				}
			}
			node.addEventListener('transitionend', handler);
			node.setAttribute('class', newClass);
		});
	}

	nextTick(fn)
	{
		setTimeout(fn, 10);//TODO:?magicNumber?
	}

	isObject(item)
	{
		return (item && typeof item === 'object' && !Array.isArray(item));
	}

	/**
	 * Deep merge two objects.
	 * -- https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge?page=1&tab=scoredesc#tab-top
	 * @param target
	 * @param ...sources
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
