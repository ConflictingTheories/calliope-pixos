export default {
  main: {
    text: 'Click Me',
    x: 100,
    y: 100,
    w: 150,
    h: 75,
    colours: {
      top: '#333',
      bottom: '#777',
      background: '#999',
    },
    children: ['sub', 'nested'],
  },
  sub: {
    text: 'Click Me Again',
    x: 110,
    y: 110,
    w: 150,
    h: 75,
    colours: { top: '#333', bottom: '#777', background: '#999' },
    children: ['main'],
  },
  nested: {
    text: 'Click Me ONE MORE',
    x: 210,
    y: 110,
    w: 150,
    h: 75,
    colours: { top: '#333', bottom: '#777', background: '#999' },
    trigger: (menu) => {
      menu.completed = true;
      // this.zone.world.loadZone("room");
    },
  },
};
