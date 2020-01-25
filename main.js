const { app, Menu, Tray } = require('electron');
const path = require('path');
const dns = require('dns');
const fs = require('fs');
const https = require('https');

const wallpaper = require('wallpaper');
const request = require('request');

let collectionDefaultPath = path.join(__dirname, 'collection\\');

let inc = 0;
let interval = null;
const banWorld = 'unliked';

const iconPath = path.join(__dirname, 'icon.png');
let appIcon = null;

app.on('ready', function() {
  appIcon = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Get wallpaper', type: 'normal', click: getWallpaper },
    { label: 'Get new random wallpapers', type: 'normal', click: gamblePhoto },
    { label: 'Unlike wallpaper', type: 'normal', click: unlikePhoto },
    { label: 'Close app', type: 'normal', click: quitApp },
  ]);

  appIcon.setToolTip('Wallpaper TitarLab');
  appIcon.setContextMenu(contextMenu);

  changeWallpaper();
});

const quitApp = function() {
  app.quit();
};

const unlikePhoto = async function() {
  const wall = await wallpaper.get();

  if (wall.includes(collectionDefaultPath)) {
    const wallName = wall.replace(collectionDefaultPath, '');

    const changedName = banWorld.concat(wallName);

    const changingFile = path.join(collectionDefaultPath, wallName);

    const changedFile = path.join(collectionDefaultPath, changedName);

    fs.renameSync(changingFile, changedFile, function(err) {});

    clearInterval(interval);

    changeWallpaper();
  }
};

const getWallpaper = async function() {
  await getPhoto();
  await changeWallpaper();
};

const getPhoto = async function() {
  dns.resolve('www.google.com', async function(err) {
    if (err) console.log('No internet');
    else {
      const date = new Date().toLocaleDateString();
      const natgeo = require('national-geographic-api').NationalGeographicAPI;

      let uri = await natgeo.getPhotoOfDay(`DAY` , `CALLBACK`)
          .then((result) => {
              return result.data[0].attributes.image.uri;
          });
      download(uri, 'collection/photo_' + date + '.jpg', function() {});


    }
  });
};

const changeWallpaper = async function() {
  inc = 0;
  const dirname = collectionDefaultPath;
  const files = fs.readdirSync(dirname);
  const filteredCollection = [];
  const collectionPath = collectionDefaultPath;

  files.forEach(function(el) {
    if (!el.includes(banWorld)) filteredCollection.push(el);
  });

  const filesAmount = filteredCollection.length;

  if (filesAmount > 0) {
    interval = setInterval(async function() {
      await wallpaper.set(collectionPath + filteredCollection[inc]);

      (await (inc >= filesAmount - 1)) ? (inc = 0) : inc++;
    }, 3000);
  }
};

const writeFile = async (file) => {
  await fs.writeFile(__dirname + '/log', file, function(err) {
    if (err) {
      return console.log(err);
    }
  });
};

var download = async function(uri, filename, callback) {
  const file = fs.createWriteStream(filename);
    const request = https.get(uri, function(response) {
      response.pipe(file);
    });
};

const gamblePhoto = async function() {
  const files = fs.readdirSync(collectionDefaultPath);
  let filteredCollection = [];
  const wallpaperPath = await wallpaper.get();
  const wallpaperPhoto = wallpaperPath.replace(collectionDefaultPath, '');
  writeFile(wallpaperPath + '\n' + wallpaperPhoto);
  await files.forEach(function(el) {
    if (!el.includes(banWorld) && el !== wallpaperPhoto) filteredCollection.push(el);
  });

  if (filteredCollection.length > 0) {
    const collectionLength = await filteredCollection.length;

    const rand = Math.floor(Math.random() * collectionLength);
    await wallpaper.set(collectionDefaultPath + '/' + filteredCollection[rand]);
  }

  clearInterval(interval);

  changeWallpaper();
};
