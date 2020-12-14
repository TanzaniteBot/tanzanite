# mb-bot-ts
[![CodeFactor](https://www.codefactor.io/repository/github/notenoughupdates/mb-bot-ts/badge?s=708ab26519121898fd964e54b6ba3afdad396ac3)](https://www.codefactor.io/repository/github/notenoughupdates/mb-bot-ts)

## About

Bot for Moulberry's Bush discord server.

## How to set up

Clone the repository with any method. Then run `npm i`. You then need to create a folder called `config` in the src folder in that folder make 2 files 1 called `credentials.ts` and `botoptions.ts`. Give it the following content:

credentials.ts:
```ts
    export let token: string = '<put ur token here>'
```

botoptions.ts:
```ts
export let prefix: string = '<put ur prefix here>' 
export let owners: string[] | string = [
// put an array or a singe string of owner ids here
]
```

Then to start the bot, run `npm start`.
