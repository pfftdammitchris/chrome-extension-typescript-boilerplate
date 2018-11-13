const idm = (function() {
  const path = 'C:\\Program Files (x86)\\Internet Download Manager\\IDMan.exe'
  const args = '/d'
  return {
    download: function(url, callback) {
      chrome.runtime.sendNativeMessage(
        'com.mybrowseraddon.node',
        {
          args: [path, args, url],
          permissions: ['child_process'],
          script: `
            var stdout = '', stderr = '';
            var app = require('child_process').spawn(args[0], args.slice(1), {detached: true});
            app.stdout.on('data', function (data) {stdout += data});
            app.stderr.on('data', function (data) {stderr += data});
            app.on('close', function (code) {
              push({code, stdout, stderr});
            close();
            });
          `,
        },
        callback,
      )
    },
  }
})()
