var assert = require('assert');
var manatoo = require('../index.js')(process.env.API_KEY);

describe('task', function() {
  var listId = process.env.LIST_ID;
  var taskId = null;

  var taskTitle = "Check the sales data on Product X"
  var taskDescription = "Pull out sales data from April"
  var taskWeight = 10
  // TODO: test users logic, this is hard because the users
  // must be members of the list to be added
  var taskUsers = ["john@example.com", "PJwjWbo0thle"]
  var taskLabels = ["sales", "urgent"]
  var taskDueAt = "2018-02-24T18:02:59.521Z"
  var taskData = {
    month: 'April',
    region: 'us-west'
  }

  it('creates a new task', function() {
    return manatoo.task.create({
      listId: listId,
      title: taskTitle,
      description: taskDescription,
      dueAt: taskDueAt,
      weight: taskWeight,
      labels: taskLabels,
      data: taskData
    }, true).then(function(task) {
      assert(task.id != null);
      assert(task.title === taskTitle);
      assert(task.description === taskDescription);
      assert(task.dueAt === taskDueAt);
      assert(task.weight === taskWeight);
      assert(task.labels.sort().join() === taskLabels.sort().join());
      assert(JSON.stringify(task.data) === JSON.stringify(taskData));
      taskId = task.id;
      return task;
    });
  });

  it('updates the description', function() {
    return manatoo.task.find(taskId, true)
    .then(function(task) {
      assert(task.id === taskId, 'task id does not match');
      assert(task.description === taskDescription, 'task description does not match');

      var newDescription = 'The quick brown fox jumps over the lazy dog';
      return task.update({
        description: newDescription
      }).then(function(updatedTask) {
        assert(updatedTask.description === newDescription);
      });
    });
  });

  it('updates only the status', function() {
    return manatoo.task.find(taskId, true)
    .then(function(task) {
      assert(task.id === taskId, 'task id does not match');
      assert(task.status === 'open', 'task status does not match');

      var newStatus = 'finished';
      return task.updateStatus(newStatus)
      .then(function(updatedTask) {
        assert(updatedTask.status === newStatus);
      });
    });
  });

  it('adds labels', function() {
    return manatoo.task.find(taskId, true)
    .then(function(task) {
      assert(task.id === taskId, 'task id does not match');
      assert(task.labels.sort().join() === taskLabels.sort().join(), 'task labels do not match');

      var labelsToAdd = ['brown', 'fox'];
      return task.addLabels(labelsToAdd)
      .then(function(updatedTask) {
        assert(task.labels.sort().join() === (taskLabels.concat(labelsToAdd)).sort().join(), 'updated task labels do not match');
      });
    });
  });

  it('adds weight', function() {
    return manatoo.task.find(taskId, true)
    .then(function(task) {
      assert(task.id === taskId, 'task id does not match');
      assert(task.weight === taskWeight, 'task weight does not watch');

      var weightToAdd = 5;
      return task.addWeight(weightToAdd)
      .then(function(updatedTask) {
        assert(updatedTask.weight === taskWeight + weightToAdd);
      });
    });
  });
});
