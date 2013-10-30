// Panel App
window.PanelApp = function() {

  var CandidateModel, CandidateView, PanelCollection, PanelView;

  CandidateModel = Backbone.Model.extend({
    defaults: {
      "id": "",
      "fullName": "",
      "urlToken": "",
      "avatarPath": "",
      "bio": "",
      "selected": false
    }
  });

  CandidateView = Backbone.View.extend({
    tagName: 'li',
    template:  _.template($('#candidate-template').html()),

    events: {
      'click .button': 'toggle'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    toggle: function(e) {
      this.model.set('selected', !this.model.get('selected'));
      this.model.collection.set(this.model, {
        remove: false
      });
    },

    render: function() {
      return this.$el.html(this.template(this.model.toJSON())), this;
    }
    
  });

  PanelCollection = Backbone.Collection.extend({
    model: CandidateModel,

    invited: function() {
      return this.filter(function(candidate) {
        return candidate.get('selected');
      });
    }
  });

  PanelView = Backbone.View.extend({
    el: '.container',

    template: _.template($('#invited-template').html()),

    initialize: function(collection) {
      this.$invited = this.$el.find('.invited');
      this.$recommended = this.$el.find('.recommended > ol');

      this.listenTo(this.collection, 'add', this.addInvited);
      this.listenTo(this.collection, 'reset', this.reset);
      this.listenTo(this.collection, 'change:selected', this.render);

      this.collection.reset(this.collection.models);
      this.render();
    },

    reset: function() {
      this.collection.each(this.addInvited, this);
    },

    render: function() {
      var invited = this.collection.invited();

      this.$invited.html(this.template({
        total: invited.length,
        invited: _.map(invited.slice(0, 2), function(model) {
          return model.toJSON();
        })
      }));
    },

    addInvited: function(model) {
      this.$recommended.append(new CandidateView({
        model: new CandidateModel(model.toJSON(), {
          collection: this.collection
        })
      }).render().el);
    }

  });

  return function(collection) {
    return new PanelView({
        collection: new PanelCollection(collection)
    });
  }

}();