const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const { Schema } = mongoose;
// const { getDate } = require('./date');
// const { getDay } = require('./date');

const app = express();

mongoose.connect('mongodb://localhost:27017/todolistDB');

const itemsSchema = new Schema({
  name: { type: String, required: true },
});

const listSchema = new Schema({
  name: String,
  items: [itemsSchema],
});

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);

const items = [
  { name: 'Do this' },
  { name: 'Do that' },
  { name: 'Dont do it' },
  { name: 'Maybe do it or not' },
].map((task) => new Item(task));

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  // const day = getDate();
  Item.find(
    ({},
    (err, tasks) => {
      if (err) {
        console.log(err);
      } else {
        if (tasks.length === 0) {
          Item.insertMany(items, { ordered: false }).catch((err) => err);
          res.redirect('/');
        }
        res.render('list', { listTitle: 'Today', newListItems: tasks });
        // mongoose.connection.close();
        // tasks.forEach((task) => console.log(task.name));
      }
    })
  );
  // const currentDay = today.getDay();

  // switch (currentDay) {
  //   case 0:
  //     day = 'Sunday';
  //     break;
  //   case 1:
  //     day = 'Monday';
  //     break;
  //   case 2:
  //     day = 'Tuesday';
  //     break;
  //   case 3:
  //     day = 'Wednesday';
  //     break;
  //   case 4:
  //     day = 'Thursday';
  //     break;
  //   case 5:
  //     day = 'Friday';
  //     break;
  //   case 6:
  //     day = 'Saturday';
  //     break;
  //   default:
  //     console.log(`Error: Current day is equal to: ${currentDay}`);
  // }
});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });

  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const { listName } = req.body;
  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Task deleted');
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, result) => {
        if (!err) {
          res.redirect(`/${listName}`);
        }
      }
    );
  }
});

// app.get('/work', (req, res) => {
//   res.render('list', { listTitle: 'Work List', newListItems: workItems });
// });

app.get('/:listName', (req, res) => {
  const paramTitle = _.capitalize(req.params.listName);

  List.findOne({ name: paramTitle }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: paramTitle,
          items,
        });

        list.save();
        res.redirect(`/${paramTitle}`);
      } else {
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get('/about', (req, res) => {
  res.render('about');
});

// app.post('/work', (req, res) => {
//   const item = req.body.newItem;
//   workItems.push(item);
//   res.redirect('/work');
// });

app.listen(process.env.PORT || 3000, () => {
  console.log('Running on port 3000');
});
