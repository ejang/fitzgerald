var Fitzgerald = Fitzgerald || {};

(function(F) {
  // Setup the namespace to trigger/bind events
  _.extend(F, Backbone.Events);

  // F.View = Backbone.View.extend({
  //   el: '',
  //   initialize: function(){},
  //   render: function(){}
  // });

  F.FeedbackListView = Backbone.View.extend({
    el: '.dot-feedback',
    initialize: function(){
      F.on('locationupdate', this.render, this);
    },
    render: function(index){
      var self = this,
          $el = $(self.el),
          feedback = this.model.at(index).get('feedback');

      $el.empty();

      _.each(feedback, function(attrs, i) {
        var color = colors[i % colors.length];
        $el.append('<li class="'+ color +'"><a href="#">' + attrs.desc + '</a></li>');
      });
    }
  });

  F.FeedbackActivityView = Backbone.View.extend({
    el: '.dot-feedback-activity',
    initialize: function(){
      this.model.bind('reset', this.render, this);
    },
    render: function(){
      var values = $.map(this.model.toJSON(), function(intersection, i) {
            return intersection.feedback.length;
          }),
          config = {
            type: 'bar',
            height: 20,
            barSpacing: 2,
            barColor: '#4b99da',
            negBarColor: '#4b99da',
            disableTooltips: true
          };

      config.barWidth = Math.floor(($(this.el).parent().width() - ((values.length - 1) * config.barSpacing)) / values.length);

      $(this.el).sparkline($.map(values, function(val, i){ return -val; }), config);
    }
  });

  F.TooltipView = Backbone.View.extend({
    el: '.dot-tooltip',
    initialize: function(){
      F.on('locationupdate', this.render, this);
    },
    render: function(index, percent){
      var self = this;

      $(self.el)
        .css('left', (percent*100) + '%')
        .html('<strong>' + self.model.at(index).get('feedback').length + '</strong> Comments');
    }
  });

  // The map slider view
  F.NavigatorView = Backbone.View.extend({
    el: '.dot-slider',
    initialize: function(){
      // Render thyself when the data shows up
      this.model.bind('reset', this.render, this);
    },
    render: function() {
      var self = this;

      $(self.el).slider({
        max: self.model.length,
        slide: function(evt, ui) {
          F.trigger('locationupdate', ui.value, ui.value/self.model.length);
        },
        stop: function(evt, ui) {
          // Update the cursor icon
          $(ui.handle).removeClass('grabbed');
        }
      });

      // Change to the grabbed icon
      $('.ui-slider-handle', self.el).mousedown(function(){
        $(this).addClass('grabbed');
      });

      // Update location to the first intersection
      F.trigger('locationupdate', 0, 0);
    }
  });

  F.AppView = Backbone.View.extend({
    el: '',
    initialize: function(){
      this.model = new F.IntersectionCollection();

      // Init the views
      this.mapSlider = new F.NavigatorView({ model: this.model });
      this.tooltip = new F.TooltipView({ model: this.model });
      this.feedbackActivity = new F.FeedbackActivityView({ model: this.model });
      this.feedbackList = new F.FeedbackListView({ model: this.model });

      // Fetch the intersection records
      this.model.fetch();
    },
    render: function(){

    }
  });

  new F.AppView();
})(Fitzgerald);