
  // write your plugin here
  import { Context, Schema, Session } from 'koishi';

  export const name = 'checkin-pstr';
  
  declare module 'koishi' {
    interface Tables {
      checkinPstrValue: CheckinPstrValue;
    }
  
    interface CheckinPstrValue {
      key: string;
      value: string;
    }
  }
  
  export interface Config {}
  
  export const Config: Schema<Config> = Schema.object({});
  
  export function apply(ctx: Context) {
    // 注册数据库表
    ctx.database.extend('checkinPstrValue', {
      key: 'string',
      value: 'string',
    }, {
      primary: 'key',
    });
  
    // 获取签到数据
    async function getCheckinData(session: Session, field: string) {
      const data = await ctx.database.get('checkinPstrValue', { key: `${session.userId}.${field}` });
      return data[0]?.value;
    }
  
    // 设置签到数据
    async function setCheckinData(session: Session, field: string, value: any) {
      await ctx.database.upsert('checkinPstrValue', [{ key: `${session.userId}.${field}`, value: String(value) }], ['key']);
    }
  
    // 初始化数据表
    ctx.command('初始化')
      .action(async ({ session }) => {
        const initialized = await getCheckinData(session, '初始化');
        if (initialized != '1') {
          await setCheckinData(session, '时间戳', 0);
          await setCheckinData(session, '初始化', 1);
          await setCheckinData(session, '总金币', 500);
          return '初始化成功，首次登陆奖励500金币';
        }
        return '您已初始化过，无需再次初始化';
      });
  
    // 签到命令
  ctx.command('签到')
  .action(async ({ session }) => {
    const initialized = await getCheckinData(session, '初始化');
    if (initialized != '1') {
      return '请先初始化';
    }
  
    const lastTimestamp = await getCheckinData(session, '时间戳');
    const currentTimestamp = Date.now(); // 获取当前时间的时间戳
    if (currentTimestamp >= Number(lastTimestamp) + 64800000) {
      const signTimestamp = currentTimestamp;
      const finishTimestamp = signTimestamp + 64800000;
      const signCoins = mathRandomInt(100, 150);
      const totalCoins = Number(await getCheckinData(session, '总金币')) + signCoins;
  
      await setCheckinData(session, '时间戳', signTimestamp);
      await setCheckinData(session, '完成时间戳', finishTimestamp);
      await setCheckinData(session, '签到当天金币', signCoins);
      await setCheckinData(session, '总金币', totalCoins);
  
      await session.send(`签到成功！获得${signCoins}个金币。您现在有${totalCoins}个金币`);
    } else {
      const nextAvailableTime = new Date(Number(await getCheckinData(session, '完成时间戳')));
      const formattedTime = nextAvailableTime.toLocaleString('zh-CN', {
        hour12: false
      });
      await session.send(`您已重复签到，请在${formattedTime}后重新签到`);
    }
  });
  }
  
  // 生成指定范围内的随机整数
  function mathRandomInt(min: number, max: number) {
    if (min > max) {
      [min, max] = [max, min];
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

