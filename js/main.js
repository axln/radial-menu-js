'use strict';

var menuItems = [
    {
        id   : 'walk',
        title: 'Walk',
        icon: '#walk'
    },
    {
        id   : 'run',
        title: 'Run',
        icon: '#run'
    },
    {
        id   : 'drive',
        title: 'Drive',
        icon: '#drive',
        selected: true
    },
    {
        id   : 'figth',
        title: 'Fight',
        icon: '#fight',
    },
    {
        id   : 'more',
        title: 'More...',
        icon: '#more',
        items: [
            {
                id   : 'eat',
                title: 'Eat',
                icon: '#eat'
            },
            {
                id   : 'sleep',
                title: 'Sleep',
                icon: '#sleep',
                selected: true
            },
            {
                id   : 'shower',
                title: 'Take Shower',
                icon: '#shower'
            },
            {
                id   : 'workout',
                icon : '#workout',
                title: 'Work Out'
            }
        ]
    },
    {
        id: 'weapon',
        title: 'Weapon...',
        icon: '#weapon',
        items: [
            {
                id: 'firearm',
                icon: '#firearm',
                title: 'Firearm...',
                items: [
                    {
                        id: 'glock',
                        title: 'Glock 22'
                    },
                    {
                        id: 'beretta',
                        title: 'Beretta M9'
                    },
                    {
                        id: 'tt',
                        title: 'TT'
                    },
                    {
                        id: 'm16',
                        title: 'M16 A2'
                    },
                    {
                        id: 'ak47',
                        title: 'AK 47'
                    }
                ]
            },
            {
                id: 'knife',
                icon: '#knife',
                title: 'Knife'
            },
            {
                id: 'machete',
                icon: '#machete',
                title: 'Machete'
            }, {
                id: 'grenade',
                icon: '#grenade',
                title: 'Grenade'
            }
        ]
    }
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.onload = function ()
{
    const svgMenu = new RadialMenu({
        parent: document.body,
        size: 400,
        closeOnClick: true,
        closeOnClickOutside: false,
        menuItems: menuItems,
        onClick: function(item)
        {
            console.log('You have clicked:', item.id, item.title);
            console.log(item);
        }
    });
    document.getElementById('openMenu').addEventListener('click', function(event)
    {
        svgMenu.open();
    });
    document.getElementById('closeMenu').addEventListener('click', function(event)
    {
        svgMenu.close();
    });
    const svgMenu2 = new RadialMenu({
        parent: document.body,
        size: 400,
        menuItems: [
            {
                id   : 'walk2',
                title: 'Walk',
                icon: '#walk'
            },
            {
                id   : 'more2',
                title: 'More...',
                icon: '#more',
                items: [
                    {
                        id   : 'eat2',
                        title: 'Eat',
                        icon: '#eat'
                    },
                    {
                        id   : 'sleep2',
                        title: 'Sleep',
                        icon: '#sleep',
                        selected: true
                    },
                    {
                        id: 'more3',
                        title: 'More...',
                        icon: '#more',
                        items: [
                            {
                                id: 'shower2',
                                title: 'Take Shower',
                                icon: '#shower'
                            },
                            {
                                id: 'workout2',
                                icon: '#workout',
                                title: 'Work Out'
                            },
                        ]
                    }
                ]
            }
        ],
        ui: {
            classes: {
                menuContainer: "menuHolder2",
                menu: "menu2",
                menuCreate: "menu2 inner",
                menuCreateNested: "menu2 outer",
                menuOpen: "open2",
                menuClose: "close2"
            }
        }
    });
    document.addEventListener('contextmenu', function(event)
    {
        event.preventDefault();
        if (svgMenu2.isOpen())
        {
            return;
        }
        svgMenu2.open(event.x, event.y);
    });
};
