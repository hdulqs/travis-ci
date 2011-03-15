Travis.Models.Repository = Travis.Models.Base.extend({
  initialize: function() {
    Travis.Models.Base.prototype.initialize.apply(this, arguments);
    _.bindAll(this, 'color', 'toJSON');
    this.builds = this.builds || new Travis.Collections.Builds([], { repository: this });
  },
  set: function(attributes) {
    this.builds = this.builds || new Travis.Collections.Builds([], { repository: this });

    var build = attributes.build;
    delete attributes.build;
    if(build) {
      this.builds.set(build);
      attributes.last_build = build;
    }

    if(attributes.last_build) {
      attributes.last_build.duration = Utils.duration(attributes.last_build.started_at, attributes.last_build.finished_at);
    }

    Backbone.Model.prototype.set.apply(this, [attributes]);
  },
  color: function() {
    var status = this.get('last_build').status;
    return status == 0 ? 'green' : status == 1 ? 'red' : null;
  },
  toJSON: function(options) {
    return _.extend(Backbone.Model.prototype.toJSON.apply(this), {
      color: this.color(),
    });
  },
});

Travis.Collections.Repositories = Travis.Collections.Base.extend({
  model: Travis.Models.Repository,
  initialize: function(models) {
    Travis.Collections.Base.prototype.initialize.apply(this, arguments);
    _.bindAll(this, 'url', 'update');
  },
  url: function() {
    return '/repositories' + Utils.queryString(this.options);
  },
  update: function(attributes) {
    attributes = _.extend(_.clone(attributes), { build: _.clone(attributes.build) });
    var repository = this.get(attributes.id);
    repository ? repository.set(attributes) : this.add(new Travis.Models.Repository(attributes));
  },
  comparator: function(repository) {
    return repository.get('last_build').started_at;
  }
});
