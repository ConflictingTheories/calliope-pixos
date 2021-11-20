export default {
  // Segment of interest
  sectionSelection: 0,
  // Text segments
  textSections: [
    { msg: "Hello, nice to meet you.", next: true },
    { msg: "Can I help you?", next: true },
    { msg: "Have a nice day", next: false },
  ],
  // Handle progression (in this case proceed through to next statement)
  next: function () {
    this.sectionSelection++;
    if (this.sectionSelection > this.textSections.length) {
      this.sectionSelection = 0;
    }
  },
};
