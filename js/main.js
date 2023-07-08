'use strict';

const menuItems = [
	{id: 'walk', title: 'Walk', icon: '#walk'},
	{id: 'run', title: 'Run', icon: '#run'},
	{id: 'drive', title: 'Drive', icon: '#drive', selected: true}, // FYI: pre-selected on 1st show!
	{id: 'fight', title: 'Fight', icon: '#fight'},
	{id: 'more', title: 'More...', icon: '#more', items: [
		{id: 'eat', title: 'Eat', icon: '#eat'},
		{id: 'sleep', title: 'Sleep', icon: '#sleep', selected: true}, // FYI: pre-selected on 1st show!
		{id: 'shower', title: 'Take Shower', icon: '#shower'},
		{id: 'workout', title: 'Work Out', icon: '#workout'},
	]},
	{id: 'weapon',title: 'Weapon...',icon: '#weapon',items: [
		{id: 'firearm', icon: '#firearm', title: 'Firearm...', items: [ // FYI: all items without icon! only text!
			{id: 'glock', title: 'Glock 22'},
			{id: 'beretta', title: 'Beretta M9'},
			{id: 'tt', title: 'TT'},
			{id: 'm16', title: 'M16 A2'},
			{id: 'ak47', title: 'AK 47'}
		]},
		{id: 'knife', icon: '#knife', title: 'Knife'},
		{id: 'machete', icon: '#machete', title: 'Machete'},
		{id: 'grenade', icon: '#grenade', title: 'Grenade'}
	]}
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.onload = function ()
{
	const radialMenu = new RadialMenu(menuItems, 400, {
		parent: document.body,
		closeOnClick: false,
		closeOnClickOutside: false,
		onClick: function(item)
		{
			console.log('You have clicked:', item.id, item.title);
			console.log(item);
		}
	});
	document.getElementById('openMenu').addEventListener('click', function(event)
	{
		radialMenu.open();
	});
	document.getElementById('closeMenu').addEventListener('click', function(event)
	{
		radialMenu.close();
	});
	const radialContextMenu = new RadialMenu(// 2nd RadialMenu with different {menuItems}
		[
			{id: 'walk2', title: 'Walk', icon: '#walk'},
			{id: 'more2', title: 'More...', fontSize: "60%", items: [ // FYI: {more} without icon! only text! fontSize: 60%
				{id: 'eat2', title: 'Eat', icon: '#eat'},
				{id: 'sleep2', title: 'Sleep', icon: '#sleep', selected: true},
				{id: 'more3', title: 'More &gt;&gt;', fontSize: "60%", items: [ // FYI: {more} without icon! only text! fontSize: 60%
					{id: 'shower2', title: 'Take Shower', icon: '#shower'},
					{id: 'workout2', icon: '#workout', title: 'Work Out'},
				]}
			]}
		],
		432,
		{
			multiInnerRadius: 0.2,
			ui: {
				classes: {
					menuContainer: "menuHolder2",
					menuCreate: "menu2",
					menuCreateParent: "inner2",
					menuCreateNested: "outer2",
					menuOpen: "open2",
					menuClose: "close2"
				},
				nested: {
					title: false
				}
			}
	});
	document.addEventListener('contextmenu', function(event)
	{ // right-mouse(as context-menu) opened at position[x,y] of mouse-click
		event.preventDefault();
		if (radialContextMenu.isOpen())
		{
			return;
		}
		radialContextMenu.open(event.x, event.y);
	});
};
