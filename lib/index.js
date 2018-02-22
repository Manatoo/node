'use strict';

var request = require('superagent');
var humps = require('humps');

Manatoo.API_BASE = 'https://manatoo.io/api';

function simpleValidate (taskId) {
  if (!taskId || typeof taskId !== 'string') {
    throw new Error('Task id must be a valid string');
  }
}

function Task(json, manatoo) {
  this.lastJsonResponse = json;
  this.manatoo = manatoo;
  this.updateAttrs(json);
}

Task.prototype.updateAttrs = function(json) {
  var attrs = json.data;
  var keys = Object.keys(attrs);
  for (var i = keys.length; i--;) {
    var key = keys[i];
    this[key] = attrs[key];
  }
};

Task.prototype.handleJsonResponse = function(promise) {
  return promise.then(function(json) {
    this.lastJsonResponse = json;
    this.updateAttrs(json);
    return this;
  }.bind(this));
};

Task.prototype.update = function(attrs)  {
  return this.handleJsonResponse(this.manatoo.task.update(this.id, attrs));
};

Task.prototype.updateStatus = function(status)  {
  return this.handleJsonResponse(this.manatoo.task.updateStatus(this.id, status));
};

Task.prototype.addLabels = function(labels)  {
  return this.handleJsonResponse(this.manatoo.task.addLabels(this.id, labels));
};

Task.prototype.addWeight = function(weight)  {
  return this.handleJsonResponse(this.manatoo.task.addWeight(this.id, weight));
};

Task.prototype.addUsers = function(users)  {
  return this.handleJsonResponse(this.manatoo.task.addUsers(this.id, users));
};

Task.prototype.removeUsers = function(users)  {
  return this.handleJsonResponse(this.manatoo.task.removeUsers(this.id, users));
};

function Manatoo(apiKey) {
  this.apiKey = apiKey;
  this.task.request = this.request.bind(this);
  this.task.manatoo = this;
}

Manatoo.prototype.request = function(action, path, payload) {
  var url = Manatoo.API_BASE + '/' + path;
  var req = request[action](url).auth(this.apiKey);
  if (payload) {
    req = req.send(payload);
  }
  return req;
};

Manatoo.prototype.task = {
  find: function(taskId, returnTask) {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('Task id parameter must be a valid string');
    }

    return this.request('get', 'tasks/' + taskId)
    .then(function (res) {
      if (returnTask) {
        return new Task(res.body, this.manatoo);
      }
      return res.body;
    }.bind(this));
  },
  create: function(attrs, returnTask) {
    if (!attrs || !attrs.listId || !attrs.title) {
      throw new Error('Task attributes parameter must be defined with a valid listId and title');
    }

    return this.request('post', 'tasks', humps.decamelizeKeys(attrs))
    .then(function (res) {
      if (returnTask) {
        return new Task(res.body, this.manatoo);
      }
      return res.body
    }.bind(this));
  },
  update: function(taskId, attrs) {
    simpleValidate(taskId);
    return this.request('put', 'tasks/' + taskId, humps.decamelizeKeys(attrs))
    .then(function (res) {
      return res.body;
    });
  },
  updateStatus: function(taskId, status) {
    simpleValidate(taskId);
    return this.request('put', 'tasks/' + taskId + '/status', { status: status })
    .then(function (res) {
      return res.body;
    });
  },
  addLabels: function(taskId, labels) {
    simpleValidate(taskId);
    return this.request('post', 'tasks/' + taskId + '/labels', { labels: labels })
    .then(function (res) {
      return res.body;
    });
  },
  addWeight: function(taskId, weight) {
    simpleValidate(taskId);
    return this.request('post', 'tasks/' + taskId + '/weight', { weight: weight })
    .then(function (res) {
      return res.body;
    });
  },
  addUsers: function(taskId, users) {
    simpleValidate(taskId);
    return this.request('post', 'tasks/' + taskId + '/users', { users: users })
    .then(function (res) {
      return res.body;
    });
  },
  removeUsers: function(taskId, users) {
    simpleValidate(taskId);
    return this.request('delete', 'tasks/' + taskId + '/users', { users: users })
    .then(function (res) {
      return res.body;
    });
  }
};

module.exports = function(apiKey) {
  return new Manatoo(apiKey);
};
