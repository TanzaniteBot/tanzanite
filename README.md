# mb-bot-ts

## How to set up:
Clone the repository with any method. Then run `npm i`. You then need to create a file called `config.ts` in the src folder. Give it the following content:
```ts
export let token: string = 'token here'
export let prefix: string = 'prefix here'
export let owners: string[] | string = [
    'list of ids here'
]
```

Then to start the bot, run `npm start`.
