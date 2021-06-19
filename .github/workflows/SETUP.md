# How to set up

1. Clone the bot (if you haven't already)
2. Run `yarn` to make sure dependencies are all set up
3. Copy `src/config/example-options.ts` to `src/config/options.ts` and change all the options to what you need

## Database

1. Make sure to have a postgresql db running on something you can access (postgres supports all OSes)
2. Make sure you have a db with the correct name (for dev it is `bush-bot-dev`, for non-dev it is `bush-bot`)

Sequelize will handle tables for you, no need to do anything besides make the db

## Start

In production, use `yarn start` to start the bot.
In dev, use `yarn dev` to start the bot.

The difference is the typescript compiler it uses. `yarn start` uses esbuild, which is speedy af but doesn't actually check code for errrors. `yarn dev` uses tsc which is slower but checks for errors.
