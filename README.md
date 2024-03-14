# Koishi-plugin-checkin-pstr

## User check-in plug-in for Koishi chatbot framework

————————————————————————
## im going to add a market system in the future ^_^

### 1. Introduce 

Koishi-plugin-checkin-pstr is a plug-in that allows users to get certain points by sending "check-in" instructions.

### 2. Use

When the user uses it for the first time, it needs to send an "initialization" to create a database about this user, which is used to store the user's number of points, check-in timestamp and whether to initialize. After initialization, you will get 500 points.

After that, users can get 100-150 random points by sending the "check-in" command.

If the user sends the "check-in" command again within 18 hours, it will be judged as a check-in failure, and you need to wait until the last check-in is successful 18 hours before signing in again.

### 3. Principle

This project is written in typescript language.

When the plug-in is enabled, the database checkinPstrValue will be created, including:

**	 User ID (QQ number, etc.)

**	 Timestamp (used to record the check-in time and calculate the check-in gap)

**	 Initialization (determining whether to initialize or not)

**	 Total gold coins (total number of user points)

```Typescript
// Register the database table

ctx.database.extend('checkinPstrValue', {

Key: 'string',

Value: 'string',

}, {

Primary: 'key',

});

// Get check-in data

Async function getCheckinData(session, field) {

Const data = await ctx.database.get('checkinPstrValue', { key: `${session.userId}.${field}` });

Return data[0]?.value;

}

// Set up check-in data

Async function setCheckinData(session, field, value) {

Await ctx.database.upsert('checkinPstrValue', [{ key: `${session.userId}.${field}`, value: String(va Lue) }], ['key']);

}

// Initialize the data table

Ctx.command('initialization')

.Action(async ({ session }) => {

Const initialized = await getCheckinData(session, 'initialization');

If (initialized ! = '1') {

Await setCheckinData(session, 'timestamp', 0);

Await setCheckinData(session, 'initialize', 1);

Await setCheckinData(session, 'total gold coins', 500);

Return 'Successful initialization, 500 gold coins will be rewarded for the first login';

}

Return 'You have initialized it, no need to initialize it again';

});

```

After creating the database, the next step is to wait for the user to enter the "check-in" command.

In the code, we mentioned whether the user is initialized, whether the two check-in times are 18 hours apart, and the accumulation of points (gold coins).

```Typescript

// Check-in command

Ctx.command ('sign-in')

.Action(async ({ session }) => {

Const initialized = await getCheckinData(session, 'initialization');

If (initialized ! = '1') {// Determine whether the user is initialized here

Return 'Please initialize first';

}

Const lastTimestamp = await getCheckinData(session, 'timestamp');

Const currentTimestamp = Date.now(); // Get the timestamp of the current time

If (currentTimestamp >= Number(lastTimestamp) + 64800000) {// Compare whether the current sending instruction time is 18 hours (64800000 milliseconds) after the last successful check-in

Const signTimestamp = currentTimestamp;

Const finishTimestamp = signTimestamp + 64800000;

Const signCoins = mathRandomInt(100, 150);

Const totalCoins = Number(await getCheckinData(session, 'total gold coins')) + signCoins;

Await setCheckinData(session, 'timestamp', signTimestamp);

Await setCheckinData(session, 'complete timestamp', finishTimestamp);

Await setCheckinData(session, 'gold coins on the day of check-in', signCoins);

Await setCheckinData(session, 'total gold coins', totalCoins);

Await session.send(`Sign-in is successful! Get ${signCoins} gold coins. You now have ${totalCoins} gold coins`);

}

Else {

Const nextAvailableTime = new Date(Number(await getCheckinData(session, 'completion timestamp')));

Const formattedTime = nextAvailableTime.toLocaleString('zh-CN', {

Hour12: false

});

Await session.send(`You have checked in repeatedly, please sign in again after ${formattedTime}`);

}

});

}

```

This is the end of the document.
