// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.

const config = new Array()
config[0] = "uid"
config[1] = "cn_gf01"
config[2] = "cookie"
// ========= ↑将生成的配置粘贴这以上↑ ========

const userRoleNumber = 0 // 如果你有多个角色，请将0依次改为1,2,3...后运行查看

let widget = await createWidget()
if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  widget.presentSmall()
}

Script.complete()

// 获取数据
async function getData(url) {
  let randomStr = randomIntFromInterval(100000, 200000)
  let timestamp = Math.floor(Date.now() / 1000)
  let sign = md5("salt=xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs&t=" + timestamp + "&r="+ randomStr + "&b=&q=role_id=" + config[0] + "&server=" + config[1])
  
  let req = new Request(url)
  req.method = "GET"
  req.headers = {
    "DS": timestamp + "," + randomStr + "," + sign,
    "x-rpc-app_version": "2.17.1",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.11.1",
    "x-rpc-client_type": "5",
    "Referer": "https://webstatic.mihoyo.com/",
    "Cookie": config[2],
  }
  
  await req.load()
  return req.loadJSON()
}

async function loadImageFromUrl(url) {
  let req = new Request(url)
  req.method = 'GET'
  return await req.loadImage()
}

async function getClock(time) {
  let timeNow = Date.now()
  let now = new Date(timeNow)
  let hoursNow = now.getHours()
  let minutesNow = now.getMinutes()*60*1000
  let secondsNow = now.getSeconds()*1000
  let timeRecovery = new Date(timeNow + time *1000)

  let tillTommorow = (24-hoursNow)*3600*1000
  let tommorow = timeNow + tillTommorow - minutesNow - secondsNow
  
  let str = ""
  if(timeRecovery < tommorow){
    str = "本日"
  }else{
    str = "次日"
  }

  return " " + str + ", " + timeRecovery.getHours() + "点" + timeRecovery.getMinutes() + "分"
}

var genshinData = {
  "current_resin": 0, // 原粹树脂
  "max_resin": 160, // 树脂上限
  "resin_recovery_time": "0", // 树脂恢复时间
  "finished_task_num": 0, // 每日任务完成数量
  "total_task_num": 4,
  "is_extra_task_reward_received": false, // 每日任务完成奖励
  "remain_resin_discount_num": 0,  // 周本减半
  "resin_discount_num_limit": 3,
  "current_expedition_num": 0, // 当前派遣人数
  "max_expedition_num": 5, // 最大派遣人数
  "expeditions": [], // 派遣详细信息
  "current_home_coin": 0, // 洞天宝钱
  "max_home_coin": 2400, // 宝钱上限
  "home_coin_recovery_time": "0" // 洞天宝钱恢复时间
}

async function createWidget() {
  // 加载base64图片
  let ResinIcon = await loadResinIcon()
  let TaskIcon = await loadTaskIcon()
  
  // 获取角色信息
  var genshinRsp = await getData("https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn")
  const userRole = genshinRsp["data"]["list"][userRoleNumber]

  // 获取原神便笺
  var genshinRsp = await getData("https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/dailyNote?server=" + config[1] + "&role_id=" + config[0])
  genshinData = genshinRsp["data"]

  // 创建小组件
  let widget = new ListWidget()

  // 背景颜色渐变
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("141414"),
    new Color("2a5398")
  ]
  widget.backgroundGradient = gradient

  // 创建原神标题部分
  var stackHeader = widget.addStack()
  stackHeader.centerAlignContent()

  // 添加 树脂信息
  var stackText = widget.addStack()
  var resinIcon = stackText.addImage(ResinIcon)
  resinIcon.imageSize = new Size(13, 13)
  stackText.addSpacer(1)
  var textItem = stackText.addText("当前树脂: ")
  textItem.font = Font.mediumRoundedSystemFont(10)
  textItem.textColor = Color.white()
  textItem.textOpacity = 0.6
  var stackText = widget.addStack()
  stackText.addSpacer(13)
  var textItem = stackText.addText(`${genshinData["current_resin"]}/${genshinData["max_resin"]}`)
  textItem.font = Font.boldRoundedSystemFont(15)
  if (genshinData["current_resin"] >= genshinData["max_resin"] * 0.9) {
    textItem.textColor = Color.white()
  } else {
    textItem.textColor = Color.white()
  }
  
  // 树脂恢复时间
  if (genshinData["current_resin"] != genshinData["max_resin"]) {
    var stackText = widget.addStack()
    var textItem = stackText.addText(`  -`)
    stackText.addSpacer(5)
    textItem.font = Font.mediumRoundedSystemFont(8)
    textItem.textColor = Color.white()
    textItem.textOpacity = 0.5
    var restDate = await getClock(genshinData["resin_recovery_time"])
    var textItem = stackText.addText(`复原时间: ${restDate}`)
    textItem.font = Font.mediumRoundedSystemFont(8)
    textItem.textColor = Color.white()
    textItem.textOpacity = 0.5
    textItem.rightAlignText()
  }
widget.addSpacer(2)
  // 添加 洞天宝钱信息
  var stackText = widget.addStack()
  var huIcon = stackText.addImage(await loadImageFromUrl("https://gitee.com/muuuj1an/GenshinTools/raw/main/img/ico/mola.png"))
  huIcon.imageSize = new Size(13, 13)
  stackText.addSpacer(1)
  var textItem = stackText.addText("洞天宝钱: ")
  textItem.font = Font.mediumRoundedSystemFont(10)
  textItem.textColor = Color.white()
  textItem.textOpacity = 0.6
  var stackText = widget.addStack()
  stackText.addSpacer(13)
  var textItem = stackText.addText(`${genshinData["current_home_coin"]}/2400`)
  textItem.font = Font.boldRoundedSystemFont(15)
  if (genshinData["current_home_coin"] >= genshinData["max_home_coin"] * 0.9) {
    textItem.textColor = Color.white()
  } else {
    textItem.textColor = Color.white()
  }
  // 洞天宝钱恢复时间
  if (genshinData["current_home_coin"] != genshinData["max_home_coin"]) {
    var stackText = widget.addStack()
    var textItem = stackText.addText(`  -`)
    stackText.addSpacer(5)
    textItem.font = Font.mediumRoundedSystemFont(8)
    textItem.textColor = Color.white()
    textItem.textOpacity = 0.5
    var restDate = await getClock(genshinData["home_coin_recovery_time"])
    var textItem = stackText.addText(`复原时间: ${restDate}`)
    textItem.font = Font.mediumRoundedSystemFont(8)
    textItem.textColor = Color.white()
    textItem.textOpacity = 0.5
    textItem.rightAlignText()
  }
widget.addSpacer(2)
  // 添加 每日委托信息
  var stackText = widget.addStack()
  var taskIcon = stackText.addImage(TaskIcon)
  taskIcon.imageSize = new Size(12, 12)
  stackText.addSpacer(2)
  var textItem = stackText.addText("每日委托: ")
  textItem.font = Font.mediumRoundedSystemFont(10)
  textItem.textColor = Color.white()
  textItem.textOpacity = 0.6
  var textItem = stackText.addText(`${genshinData["finished_task_num"]}/${genshinData["total_task_num"]}`)
  textItem.font = Font.boldRoundedSystemFont(10)
  if (genshinData["finished_task_num"] != genshinData["total_task_num"]) {
    textItem.textColor = new Color("#FC766A")
  } else {
    textItem.textColor = Color.white()
  }
widget.addSpacer(2)
  // 生成派遣状态, 最短的派遣恢复时间
  var i = 0
  var min_index = 'nolabor'
  var minCdTime = 500000
  var finish_count = 0
  for (var i = 0; i < genshinData["expeditions"].length; i++) {
    var current_expeditions = genshinData["expeditions"][i]
    if (current_expeditions["status"] == "Finished") {
      min_index = i
      minCdTime = -1
      finish_count++
    } else {
      if (minCdTime > parseInt(current_expeditions["remained_time"])) {
        min_index = i
        minCdTime = parseInt(current_expeditions["remained_time"])
      }
    }
  }
// 添加 派遣信息
  var stackText = widget.addStack()
  var laborIconUrl = genshinData["expeditions"][min_index]["avatar_side_icon"]
  var laborIcon = stackText.addImage(await loadImageFromUrl(laborIconUrl))
  laborIcon.imageSize = new Size(13, 13)
  laborIcon.cornerRadius = 5
  stackText.addSpacer(1)
  var textItem = stackText.addText("探索派遣: ")
  textItem.font = Font.mediumRoundedSystemFont(10)
  textItem.textColor = Color.white()
  textItem.textOpacity = 0.6
  if (minCdTime < 0) {
    var textItem = stackText.addText(`已完成 ${finish_count}/${genshinData["max_expedition_num"]} 人`)
    textItem.font = Font.boldRoundedSystemFont(10)
    textItem.textColor = new Color("#FC766A")
  } else {
    if (minCdTime != 500000) {
      var restDate = await getClock(minCdTime)
      var textItem = stackText.addText(`进行中`)
      textItem.font = Font.boldRoundedSystemFont(10)
      textItem.textColor = Color.white()
//      var textItem = stackText.addText(`${restDate}`)
//      textItem.font = Font.mediumRoundedSystemFont(5)
//      textItem.textColor = Color.white()
//      textItem.textOpacity = 0.5
    }
  }
widget.addSpacer(2)
  // 参量质变仪
  var stackText = widget.addStack()
  var transformIcon = stackText.addImage(await loadImageFromUrl("https://gitee.com/muuuj1an/GenshinTools/raw/main/img/ico/jingyanshu.png"))
  transformIcon.imageSize = new Size(13, 13)
  stackText.addSpacer(1)
  var textItem = stackText.addText("参量质变仪: ")
  textItem.font = Font.mediumRoundedSystemFont(10)
  textItem.textColor = Color.white()
  textItem.textOpacity = 0.6
  if (genshinData['transformer']['recovery_time']['reached']) {
    var textItem = stackText.addText(`可使用`)
    textItem.font = Font.boldRoundedSystemFont(10)
    textItem.textColor = new Color("#FC766A")
  } else {
    if (genshinData['transformer']['recovery_time']['Day'] != 0) {
      var textItem = stackText.addText(`${genshinData['transformer']['recovery_time']['Day']}天`)
      textItem.font = Font.boldRoundedSystemFont(10)
      textItem.textColor = Color.white()
    }
    if (genshinData['transformer']['recovery_time']['Hour'] != 0) {
      var textItem = stackText.addText(`${genshinData['transformer']['recovery_time']['Hour']}小时`)
      textItem.font = Font.boldRoundedSystemFont(10)
      textItem.textColor = Color.white()
    }
    if (genshinData['transformer']['recovery_time']['Minute'] != 0) {
      var textItem = stackText.addText(`${genshinData['transformer']['recovery_time']['Minute']}分钟`)
      textItem.font = Font.boldRoundedSystemFont(10)
      textItem.textColor = Color.white()
    }
    if (genshinData['transformer']['recovery_time']['Second'] != 0) {
      var textItem = stackText.addText(`${genshinData['transformer']['recovery_time']['Second']}秒`)
      textItem.font = Font.boldRoundedSystemFont(10)
      textItem.textColor = Color.white()
    }
  }
  return widget
}

async function loadResinIcon() {
  // Base64 img
  const url = "data:image/png;base64,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"
  
  let req = new Request(url)
  let icon = await req.loadImage()
  return icon
}

async function loadTaskIcon() {
  const url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABEvSURBVHhexZsJVFvXmYDve9oBSUiAQCwSIEDGxmA7BmM7NiZ2HNdjx07iOBOf+DRuM0ndZZqezEyadua0k/ZkpidNZzL1TKbTzEnTpHHiJqkd1/FSbxiPF/BubMAISYBYjEAraH/vzX+la7CQ2IP8ncOR7n+vBPe/99/ufaAHiUajUeuydXmk+UCgyesDQcBSy1g+WwVvqYgk8TwwBWi12nxEUyoacWm6XJ2OiBPOg1IAzWepKk3WfFlx3kMKDoUqQcaLdCWWB6IAXV5eKWz61B2b/nnjs5t+spmiKWl+fn4Z6U4oCVcAbH0xh3hLy4pWpxflLV6tVS9Y/tD8DWqa4Rar1eokMixhJFwBQoaqoigkenrDa1tomsejKJp+at3fP0FRlFAiEFSTYQkjoXaHwx5NUStrK3cUPLxk+3aYdNj7pyQrsgJBX5uh8wqnTE7rt7vtrvAHEkDCdkANquELOHo1nxZQm2u//9f3Jn+PDQ+/+IyQL6FZQWjV/PnzhUQ85yRsB/A03HKYc96uJ96sKdEuXUXEI4iEElmWSue7dPOQhfUFJTaXo4N0zSkJ2QE426MQvaA4r1KxrHzTE0QcwyL92scXFNVkcDTSl2g0BUQ8p8y5AjIzM5MRj6mlaZr6xrY3d/J5QgnpioHPEwif3/rG17GZhMBc9Hq9lHTNGXOtADpFKFkLMV/8zad+VZOp1C4g8jCDtrvorrWbtCKkybOLX3rm1+txpAj6fOtANKdmOqdfXqgpXEFRXOHy8i25m9Z890WaoqN+35nzR5Clx4RKdAuJJEJWWkGJc3jgdkd3U0CZKk+xO51m0vWVM2MFFGUVZcgz5FKHw+EhoiiKNJr58LJUpcyXfHfHb34gEibJIj0Ruvs60NUb59Cwx43SFCqUKleSHqiMIDfQ51eXXm8+cdE9PChNTVEEHW7HXdJ9P1RhYaEqNTU1Bf6OYSKbFjNWAJ48ZG9blLLUBUqFXKGUpvOFEqF/eHg4GC5xafQI2DL9oxc/e1EhyyokHwvDsiw6ceYA8vkiuhuw9aF5RRUI/ES4jRHwhUnlJTXausaPG1gUzJbKZbARnI7c3FyJSi7XKmXKcmWq4mHEcgvpEN9oc9tmlDvMWAF45fHkv7bye9VVZZtX+YKejKHhPp1CKi/mKHYehDzeK7s+fCo/e+EK8pERmpovoXZzM2kh5A/4YNUppM7UEEmEJIk8vbRwubT+yr4mPqLzFbLUEj5NVxVpqiofW/Gtjdrs8qzWjgsd7RbTWRjORT41PWZVh+u02jXVZU9teLL21Vdx2+Nz9Vnt5uaOvqa2vOwSZWXZxm3hgffhdNnQ/i9/j0JMiEgiQFqMtmx4DikVGUQyyrWW418YzDd6tFkLS1RKbWmyJFWN5YfO/sdbpy5/dNTUZfpLeOAMmJ0CcnVFNJ9e+/pLx98UCsQjIUskEiGpTE5ao7Asg/58bC+yDvYRSTSK1PSwEng8PpGM4na7kN/nIy0ECgx4fvqb9a8wjOf0nY6OFiKeNrMKgx7G08OyQW7A0XWLiJBQGH/ymMar9eNOHmN3DKDzl06SVjRSqSys2HsMOrqaAyEvywoEPUQ0I2algN7eXg/Hcq7O3qbwCkQmH+XsR8A239RyibTGp9VwI/wTD6zYe0qw3G1pphDlMRgMsyqcZqUA7O3B8yQ1GU+1iURiJJPLw85sLP3WHlR/4ShpTc65xhOop6+TtKLBShCLxajJWN8GTRFUmLNKmWesgHCc5zMbIMPl1y57rny8lbc7B9Cxus8RM8bpTQT2FThMDkCmGI8UMIfa6mcXcYjjCRC9riC3IDqTmgYzCYM0zvDgdSmfL+L9w6692yv0tZsjXdFgj3/4xD6I914imToMKKGjqw3lqguQRJJMpKOoM3Sl5fra1IYbB28zbCAnDdIlqCAt0DWtcDgtBeDCJkuZsQGnt+qM4uQf/82nuzXqUnysHYPNboXJ/xF5fTNK0MLgUGnqvAP5QR5KToqtiyDB0lYv2lrSamxocg73SxWp8jwVP6t70DsYIEMmZcoKwPYuFPA24sPMmsodBbuf2fOyXJqhJd1RYPs9euozSHCmv/JjwaZjNLdAfqBCcpmCSEdJEkvTqiu2VgVCvg5j1zUfI2BKZAo5JI1OBxkyIZMqAJ/k8DVcNXiLlXyaL/zOjnfWr1/xzW9A3I/dl0DznWuo7tyhmEQnHiJBChLyxTDWTyTxwamzEUI9ny9EmRnZRDoKny8QlxWtqi7MXUxdvX3MzLGhQrk0NVlXrOuBSMWSYXGZUAH4DG9Y5voauHZNhf4R1SvPf7C7MHfRSlyskCEjBIMBdPbiUXT91kXEcZObIZ8nQlX67SgnvQz12VrA5idXWHevOexUc9X5MckSRB8qMy1f//CSp8tsrp72Xmub2DvkKUqXSe02l8tNhsUQNxPER9cUQ1XxaKQXC6WCF7a9ta5Cv2YTjxYIyJAo+votqB5KW9fQlHZdOO1dWrwNKaWRa0HHcC9qbN0HSgiG25ORkixDq6ofQ9lZcS0QO9DQLUP94f/57OWjHo8ziCiuzc8wFywWS4xNjlUADeFtHsfRS6FHvHnN3y5Yv2LXdsi9s0h/FLiIuXztLGoxXJ/SqmNwnlBRuBllKUqIJILVaURXDPvheybcsVGU6MpQ5eIaJBbFP2TyeJ3WU40f/vGzv/zyOvx9AZjXZZPFhLPWkV8yogB8V4evq7CTW1HxZN7jj3z/SZUyXNPHgG0STxrX8z7/9BxdqWYt0qoWk1Y0loEm1GQ+QlpTQygUo8Vl1ai0ZDGYRXyLHnBY7hw6887ndY0fmXDmyqO5hrbOThN0cRS2cwFH44lnFuRUyJ5/4l+fzlWVVIKdxzUPB8T243V/ghhvJ5KpU6hehkpyYg6Eo2jvvYDaunF1Oz2kKXK0dvWW8OFKPGAHcL1Ww9X3D/54X5u50c5RnJXHMA20ICSAhafCHqWj97a71dxw0+cfGgh/Kg6pMiVaWfUoSk+LaxXjgp3dZJPH6NTVSKNaRFpTA5fQKyrXjTt5jD/gsbd1Xr5pslx14jbN0fwAjye4t8pUYU5hEaKYpfiiUixM5n19yxs1i0vX/xWEuxQyZgwcMpiaocKrA1ubONnJkBeiJUVbwf6jg4cIAimOJ94xPhr7k2vGg+iu/Q6RxAfb/tJFq8O+IF4NggmG/J4brScPv/fFa6ewQ2QRNczR3CWz2Yy/nBv7KR6+pcUXlfCFwoz0wqQXtv5is06zeA1NQUyIQyDoRw1X6sat4FKT1agSwh1EECKJwIeibtFjoHkw2+tg9mNzJhbC4qW2T5HNjbPbWIoK5qPqh2qhOozvAMGZsqbuG2ff2//DA913W4fA9oMUzV3P7ey8UQdJJhkWEwXC4FtafFFJQVDAbewUn97ww53ylPiZH6arxxgOhV5yzodJFivRsnnPQrIT/Ufis+GFjyIkJzt2aBCUcAzC15goGIQEqaFlL3J7Ry1SBE7vYQiB+XnFRBKLe8jW/fnJtz7ATg+3KY4yCX1D529brUPhAfcRf98QcPqL7+pojkoR8kX0t7bveQwKkM34VpcMicLjHUIn62HrWrshy0tG1fN2IIko+nAE79T5axBKG/NkkL0XoaYTsHJjoqAv4EYXWj4Kv2K/s3bV4+E8IB4sx7C3DGcPv/Pxdw75AsMMPi8IUuzZjo6OcY/VJ8wE8S1tdk5OK76rYzgm7eLNg4ZBZ/dNvbZKH883CATC8Nb0+/1Il7EGJUvSSM8oxdUIqaLOiCNIoNbBPwNdREDAGWO6rACJpSx4+c3jxnyv1zWw78i/7Nn75esXQkwQvAhroISCIyaTCfbX+Ey4A+4H39Xh6ypYQZFSli16eef/7szNmocfbYmL08qiIVu029BWRH4mwnIbIeOYg6PkVBalZsZ1QWF6re3X3v7whd/128xebOuI4501dhvxgcmkTLgD7mcQqiuVOtMI1VkWhEnRqcY/XMnJLPHhuhzn4WTYCOJkEFEsCngiXWpI/AqXht9OiCwDfAG4KJc10k5Jg8mr4k+ehdleaz35xS/efWbvkNcegi1v4wT0IWOnccrnhFNWAGZwcDBgdzrb8HUVzC6tselLIwSSDp1mSQWPjj3KFSVFlCBLp5B+ZcT+p4JCHQmNFM0ieUb8yTNMMHD07Lvv/m7/q/UchGQO0e25BZqj165dm1ZqOi0FEDh8V4evqyCs57SaL1pdLmtLuf6RVfFiMVZCupZDSfIpzh4DQ3kCmFRonJWHVPyTI2/86s9n9oDB4BMg9rKx03wOnN3UCwnC+IY1CaZu0w0eYo/DtmO8fg/ndNhhVRjSG42jh0LugamfVA3ZOGTriq8wPHn8uzyeIfhC2F4s71R7Z+cV0j1tZqwAzB0oKCBrG9JrlxfjyU+kBKuRQv7hyZUQ8HCov328yY/+jhJNVQmM8rZb2g2ke0bMSgH4ohK2qzxbpQ9XjZHVccRVAq6W+8AvwxzGBffhMfEq4rHfnZ1RXApGkjzbhyhmpQAxRWXLJGkipRT7+AiRVbIxoVAg5mAy5KdQv2l8Mx0AEw76Ylc/xASCDvsgzH1Ue/LkzCKFPEcCOUfsGdk0mIkTHAFfUdcu21VTmLO42uNz9nX23T5/6fbBQx8ffX1vj639ekXxmmWQNUZFh6CXQsIkFgkl0RMddrDI1hm7HgwbCn5y+Of/tvfwT/YN+91t8CmXSJgsEQolkGJyXXfMDV12pz2c8s6E+MY2NSidJv+5h0o36T0em6+541w/kcMUKSG+tHhy3d+Vb1y9+9v0mLMF7OE1kBDRvIiYZTnUeZ1DTCBaAbiGP37hvXf3fvkzSI0oFkb74HvDT5MW5VamK2TZyQ23Dtwxdpk/ANG0IwBmxjsAP5lBsdzCHmurtd/R3cyjuSYkFJxvNxkbU+QyBw8q7GbjuX6NuiyEkyXysTAcTAWXvPdCo83CIa8jdvVvtdcf/u2nPzgFbyGz5Z1u7zKeTstIbwuxjM3m6nX39LcEcWaqkkl7Bic4+JyIGe+AgoKCTF6AJzB0G3DWFaP9gpyCcprHVeOnw372vWMvqdN1UedgFMWhPJwWw2vXdVAIXt/7sNo6br329qO/xrfP8PWXxgl1tD4vL8sLX9bZ2Qnl1PSZ8Q7Az+SQx1Lixjb8TA++roItm9bUdubWyiXbluLHXkg3QEHKCyvv5lBgOHr1ff5hxy/f3/m2a6g/gDM8nOSQrrFweOWdTmdMmTtVZuUEJwPf1eHrKo/XKfT5hsxlJatX3H/WiOuESK0wuvoc5PcHTv77f1+5fRTSJ8qG09uZZHhTZU4VAHCqrKxuJsiUmHtuuIs1lXyVUjPmJCN667d1Xjr53v5X63BVhwub6eb202VWecBUaG1tdTM0V4ffv/PJtw+5h/HRR3w8Xpf1vz7evT/cwCWt0Rg+wJxL5noHhMEXlfiujmECylDIZykrrgFTiK6cwFegg6f3/Lapre4uPswwWsyXSdecMuc74B5pmWnnYVu7j19439DR03SeiEfoudt2+dCZ/ww/9kILhf9HxHNOwhRw+fLlIA8xZ/D7Dw7+059CoeDII18MGwx+eOinn+L3IZqrNxgME18Xf4UkTAGYNoulG19Umrqvu5razxwjYtRqajzRajpvYznKZDabE/J/AvdIqAIw+JYWssDA77/4x+P+gMcVDPqH3z/wo6PY60sDnvHi/ZyRECd4Py6XK5QqUzL+wJBarSoKDNot5tOX/tBC0+hKc3d3/EfD5pDoIJw46MJc7XaJOEVB03x6yO+ymzpM+0A+9UfJviISbgIElqbYRnx5AWV0kKM4HPISPnnMg1IAMnR1GWHiAxD27OSi8oHwwBQAcHQo1BCEnYDfR0SJBqH/B00UIY2j4TgTAAAAAElFTkSuQmCC"
  
  let req = new Request(url)
  let icon = await req.loadImage()
  return icon
  }

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function md5(string){
    function md5_RotateLeft(lValue, iShiftBits) {
            return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }
    function md5_AddUnsigned(lX,lY){
            var lX4,lY4,lX8,lY8,lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                    if (lResult & 0x40000000) {
                            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    } else {
                            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                    }
            } else {
                    return (lResult ^ lX8 ^ lY8);
            }
    }         
    function md5_F(x,y,z){
            return (x & y) | ((~x) & z);
    }
    function md5_G(x,y,z){
            return (x & z) | (y & (~z));
    }
    function md5_H(x,y,z){
            return (x ^ y ^ z);
    }
    function md5_I(x,y,z){
            return (y ^ (x | (~z)));
    }
    function md5_FF(a,b,c,d,x,s,ac){
            a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
            return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_GG(a,b,c,d,x,s,ac){
            a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
            return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_HH(a,b,c,d,x,s,ac){
            a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
            return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_II(a,b,c,d,x,s,ac){
            a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
            return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_ConvertToWordArray(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1=lMessageLength + 8;
            var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
            var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
            var lWordArray=Array(lNumberOfWords-1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while ( lByteCount < lMessageLength ) {
                    lWordCount = (lByteCount-(lByteCount % 4))/4;
                    lBytePosition = (lByteCount % 4)*8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                    lByteCount++;
            }
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
            lWordArray[lNumberOfWords-2] = lMessageLength<<3;
            lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
            return lWordArray;
    };
    function md5_WordToHex(lValue){
            var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
            for(lCount = 0;lCount<=3;lCount++){
                    lByte = (lValue>>>(lCount*8)) & 255;
                    WordToHexValue_temp = "0" + lByte.toString(16);
                    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
            }
            return WordToHexValue;
    };
    function md5_Utf8Encode(string){
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                            utftext += String.fromCharCode(c);
                    }else if((c > 127) && (c < 2048)) {
                            utftext += String.fromCharCode((c >> 6) | 192);
                            utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                            utftext += String.fromCharCode((c >> 12) | 224);
                            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                            utftext += String.fromCharCode((c & 63) | 128);
                    }
            }
            return utftext;
    };
    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
    string = md5_Utf8Encode(string);
    x = md5_ConvertToWordArray(string);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    for (k=0;k<x.length;k+=16) {
            AA=a; BB=b; CC=c; DD=d;
            a=md5_FF(a,b,c,d,x[k+0], S11,0xD76AA478);
            d=md5_FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
            c=md5_FF(c,d,a,b,x[k+2], S13,0x242070DB);
            b=md5_FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
            a=md5_FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
            d=md5_FF(d,a,b,c,x[k+5], S12,0x4787C62A);
            c=md5_FF(c,d,a,b,x[k+6], S13,0xA8304613);
            b=md5_FF(b,c,d,a,x[k+7], S14,0xFD469501);
            a=md5_FF(a,b,c,d,x[k+8], S11,0x698098D8);
            d=md5_FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
            c=md5_FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
            b=md5_FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
            a=md5_FF(a,b,c,d,x[k+12],S11,0x6B901122);
            d=md5_FF(d,a,b,c,x[k+13],S12,0xFD987193);
            c=md5_FF(c,d,a,b,x[k+14],S13,0xA679438E);
            b=md5_FF(b,c,d,a,x[k+15],S14,0x49B40821);
            a=md5_GG(a,b,c,d,x[k+1], S21,0xF61E2562);
            d=md5_GG(d,a,b,c,x[k+6], S22,0xC040B340);
            c=md5_GG(c,d,a,b,x[k+11],S23,0x265E5A51);
            b=md5_GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
            a=md5_GG(a,b,c,d,x[k+5], S21,0xD62F105D);
            d=md5_GG(d,a,b,c,x[k+10],S22,0x2441453);
            c=md5_GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
            b=md5_GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
            a=md5_GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
            d=md5_GG(d,a,b,c,x[k+14],S22,0xC33707D6);
            c=md5_GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
            b=md5_GG(b,c,d,a,x[k+8], S24,0x455A14ED);
            a=md5_GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
            d=md5_GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
            c=md5_GG(c,d,a,b,x[k+7], S23,0x676F02D9);
            b=md5_GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
            a=md5_HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
            d=md5_HH(d,a,b,c,x[k+8], S32,0x8771F681);
            c=md5_HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
            b=md5_HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
            a=md5_HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
            d=md5_HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
            c=md5_HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
            b=md5_HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
            a=md5_HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
            d=md5_HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
            c=md5_HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
            b=md5_HH(b,c,d,a,x[k+6], S34,0x4881D05);
            a=md5_HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
            d=md5_HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
            c=md5_HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
            b=md5_HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
            a=md5_II(a,b,c,d,x[k+0], S41,0xF4292244);
            d=md5_II(d,a,b,c,x[k+7], S42,0x432AFF97);
            c=md5_II(c,d,a,b,x[k+14],S43,0xAB9423A7);
            b=md5_II(b,c,d,a,x[k+5], S44,0xFC93A039);
            a=md5_II(a,b,c,d,x[k+12],S41,0x655B59C3);
            d=md5_II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
            c=md5_II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
            b=md5_II(b,c,d,a,x[k+1], S44,0x85845DD1);
            a=md5_II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
            d=md5_II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
            c=md5_II(c,d,a,b,x[k+6], S43,0xA3014314);
            b=md5_II(b,c,d,a,x[k+13],S44,0x4E0811A1);
            a=md5_II(a,b,c,d,x[k+4], S41,0xF7537E82);
            d=md5_II(d,a,b,c,x[k+11],S42,0xBD3AF235);
            c=md5_II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
            b=md5_II(b,c,d,a,x[k+9], S44,0xEB86D391);
            a=md5_AddUnsigned(a,AA);
            b=md5_AddUnsigned(b,BB);
            c=md5_AddUnsigned(c,CC);
            d=md5_AddUnsigned(d,DD);
    }
return (md5_WordToHex(a)+md5_WordToHex(b)+md5_WordToHex(c)+md5_WordToHex(d)).toLowerCase();
}