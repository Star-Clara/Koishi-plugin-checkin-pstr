"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.Config = exports.name = void 0;
const koishi_1 = require("koishi");
const koishi_2 = require("koishi");
exports.name = 'checkin';
exports.Config = koishi_1.Schema.object({});
async function apply(ctx) {
    ctx.database.extend("checkin_pstr_value", {
        key: "string",
        value: "string",
    }, {
        primary: "key"
    });
    const logger = ctx.logger("签到");
    function mathRandomInt(a, b) {
        if (a > b) {
            // Swap a and b to ensure a is smaller.
            var c = a;
            a = b;
            b = c;
        }
        return Math.floor(Math.random() * (b - a + 1) + a);
    }
    var 签到金币 = 0;
    ctx.command('初始化').action(async ({ session }, ...args) => {
        if (((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '初始化' }))[0]?.value) != 1) {
            await ctx.database.upsert('checkin_pstr_value', [{ key: (session.userId) + "." + '时间戳', value: 0 }], ['key']);
            await ctx.database.upsert('checkin_pstr_value', [{ key: (session.userId) + "." + '初始化', value: 1 }], ['key']);
            await ctx.database.upsert('checkin_pstr_value', [{ key: (session.userId) + "." + '总金币', value: 500 }], ['key']);
            return '初始化成功，首次登陆奖励500金币';
        }
    });
    ctx.command('ini').action(async ({ session }, ...args) => {
        await ctx.database.upsert('checkin_pstr_value', [{ key: (session.userId) + "." + '初始化', value: 0 }], ['key']);
    });
    ctx.command('签到').action(async ({ session }, ...args) => {
        if (((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '初始化' }))[0]?.value) == 1) {
            logger.warn((String((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '时间戳' }))[0]?.value) + ''));
            if ((Math.round(Number(new Date()))) >= Number((Number(await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '时间戳' }))[0]?.value)) + Number(64800000)) {
                签到金币 = mathRandomInt(100, 150);
                await ctx.database.upsert('checkin_pstr_value', [{ key: (session.userId) + "." + '时间戳', value: (Math.round(Number(new Date()))) }], ['key']);
                await ctx.database.upsert('checkin_pstr_value', [{ key: (session.userId) + "." + '完成时间戳', value: (((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '时间戳' }))[0]?.value) + Number(64800000)) }], ['key']);
                logger.info((String((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '时间戳' }))[0]?.value) + ''));
                await ctx.database.upsert('checkin_pstr_value', [{ key: (session.userId) + "." + '签到当天金币', value: Number(签到金币) }], ['key']);
                await ctx.database.upsert('checkin_pstr_value', [{ key: (session.userId) + "." + '总金币', value: Number((Number(((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '总金币' }))[0]?.value)) + Number(((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '签到当天金币' }))[0]?.value)))) }], ['key']);
                await session.send((['签到成功！获得', (await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '签到当天金币' }))[0]?.value, '个金币。您现在有', (await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '总金币' }))[0]?.value, '个金币'].join('')));
            }
            else {
                logger.info((String((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '完成时间戳' }))[0]?.value) + ''));
                await session.send((['您已重复签到，请在', koishi_2.Time.template('yyyy-MM-dd hh:mm:ss', (new Date(((await ctx.database.get('checkin_pstr_value', { key: (session.userId) + "." + '完成时间戳' }))[0]?.value)))), '后重新签到'].join('')));
            }
        }
        else {
            return '请先初始化';
        }
    });
}
exports.apply = apply;
