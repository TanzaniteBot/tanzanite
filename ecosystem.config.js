module.exports = {
  apps: [
    {
      name: 'bot-windows',
      script: 'yarn',
      args: 'start',
      interpreter: 'powershell.exe'
    },
    {
      name: 'bot-linux',
      script: 'yarn',
      args: 'start',
      interpreter: '/bin/bash'
    },
  ]
};
