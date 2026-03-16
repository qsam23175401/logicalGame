# 邏輯閘小遊戲

本來打算放到GitHub Pages，但因為部署太笨重，打算放到firebase弄新站點

跟magicianAcademy的部署放到一起，這裡放一個ng+ts通用模板，以後開發速度比較快。

通用的部分
雜湊 45618b72fb98be39ab8f62ca68a84ea5d062d0a7
使用方式
複製這個專案--> git checkout 雜湊--> npm install --> ng serve

未來遊戲製作完成，打包--> 拿dist/內的小遊戲專案到主遊戲dist/。
fireabse target:apply newGameTarget newGameURL(prefix)
以firebase.json設定-> 加入 target->其他複製貼上檢查一下。




## 遊戲規則
用中文解釋小朋友才好懂
1. 每個關卡有輸入和輸出，邏輯閘透過按鈕控制輸入，輸出會顯示在燈泡上(0->1)
這一點都不好玩!
要用可愛的水果，問問老闆有沒有，老闆在刁難的問客人零錢夠不夠!
範例:「請問老闆，你有沒有賣蘋果或香蕉呢？」　or邏輯
「一共60元，請問小朋友，你的零錢有沒有50元和10元呢？」 and邏輯
「請問老闆，你沒有賣蘋果，對嗎？」 not邏輯
「請問小朋友，你沒有50元，也沒有100元，對嗎？」 xor邏輯
剩下蘋果和香蕉的時候：隔壁先來的客人說他要買蘋果或香蕉，那你想要買蘋果和香蕉的話，你是缺了蘋果和香蕉嗎？　(nand)
2. 每個關卡有邏輯閘，邏輯閘有AND, OR, NOT, XOR, NAND, NOR
