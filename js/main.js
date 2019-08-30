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
        icon: '#drive'
    },
    {
        id   : 'figth',
        title: 'Fight',
        icon: '#fight'
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
                icon: '#sleep'
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
window.onload = function () {
    var svgMenu = new RadialMenu({
        parent      : document.body,
        size        : 400,
        closeOnClick: true,
        menuItems   : menuItems,
        onClick     : function (item) {
            console.log('You have clicked:', item);
        }
    });

    var openMenu = document.getElementById('openMenu');
    openMenu.onclick = function () {
        svgMenu.open();
    };

    var closeMenu = document.getElementById('closeMenu');
    closeMenu.onclick = function () {
        svgMenu.close();
    };
};