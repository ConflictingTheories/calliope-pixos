export default {
  // Segment of interest
  sectionSelection: 0,
  // Text segments
  textSections: [
    { msg: "It was a cold dark night", next: true },
    { msg: "Our hero found himself like many do", next: true },
    { msg: "...Lost and Cold. He needed a snickers bar.", next: false },
  ],
  // Handle progression (in this case proceed through to next statement)
  next: function () {
    this.sectionSelection++;
    if (this.sectionSelection > this.textSections.length) {
      this.sectionSelection = 0;
    }
  },
};
