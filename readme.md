# Web-сервис для мониторинга устройств novastar

1. [Запуск сервиса](#ServiceStart)
2. [Запросы к сервису](#RequestsExamples)
	1. [Общий запрос данных по всем устройствам, подключенным к хосту](#commonGet)
	2. [Запрос данных карты, по имени COM порта](#getByComPortName)
	3. [Установка яркости порта экрана](#setBrightness)
	4. [Установка яркости всем портам экранов карты, подключенной к COM порту](#setBrightnessToAll)
	5. [Установка режима автояркости карты, подключенной к COM порту](#setAutoBrightness)
3. [Адрес репозитория](#Repository)
4. [Сборка](#Build)
5. [Формирование исполняемых файлов](#Executables)
6. [Контакты](#Contacts)

## <a name="ServiceStart"></a>Запуск сервиса
При имеющемся `exe` файле сервиса `novastar-ws-win.exe` - скопировать его на хост и запустить без параметров.  
```Bash
novastar-ws-win.exe
```
При запуске без параметров сервис использует порт `5000`  
В качестве параметра можно укахзать номер порта на котором будет работать сервис :  
```Bash
./bin/novastar-ws-win.exe port=3000
```

Также в качестве параметра можно указывать : 
* ключевое слово `silent`, в таком случае не будут выводиться сообщения в консоль запуска.
* `test` - если сервис не обнаружит подключенных устройств novastar, то выведет тестовую информацию
* `emulateTimeoutError` - при запуске сервис эмулирует ошибку `Unhandled exception`, которая возникает при таймауте в `node_modules\@novastar\codec\build\main\lib\Connection.js` : `class Connection`, `method wait`
#### Запуск исходника на хосте с установленной NodeJS
```Bash
node ./dist/index.json port=3000
```
## <a name="RequestsExamples"></a>Запросы к сервису

### <a name="commonGet"></a>Общий запрос данных по всем устройствам, подключенным к хосту
`GET` запрос без параметров вернет полный список устройств, подключенных к хосту и их подробные характеритики, например :
```Bash
http://127.0.0.1:5000/
```

результат :  
```JSON
{
	"error":0,
	"errorDescription":"",
	"sendingCards":[
		{
			"errorCode":0,
			"errorDescription":null,
			"COM":"COM6",
			"version":"4.7.7.0",
			"DVI":false,
			"autobrightness":false,
			"portInfo":{
				"path":"COM6",
				"manufacturer":"Silicon Laboratories",
				"serialNumber":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
				"pnpId":"USB\\VID_10C4&PID_EA60\\3E6CAE33869BEB11B2363EE3D922184A","locationId":"Port_#0006.Hub_#0001",
				"vendorId":"10C4",
				"productId":"EA60"
			},
			"portsData":[
				{
					"portNumber":0,
					"active":true,
					"errorCode":0,
					"model":"Unknown ReceivingCard (4508h)",
					"brightness":20,
					"brightnessRGBV":{
						"overall":20,
						"red":255,
						"green":255,
						"blue":255,
						"vRed":255
					},
					"calibrationMode":{
						"isOn":false,
						"type":0
					},
					"displayMode":0,
					"gammaValue":2.8
				},
				{
					"portNumber":1,
					"active":false,
					"errorCode":0,
					"model":null,
					"brightness":null,
					"brightnessRGBV":null,
					"calibrationMode":null,
					"displayMode":null,
					"gammaValue":null
				},
				{
					"portNumber":2,
					"active":false,
					"errorCode":0,
					"model":null,
					"brightness":null,
					"brightnessRGBV":null,
					"calibrationMode":null,
					"displayMode":null,
					"gammaValue":null
				},
				{
					"portNumber":3,
					"active":false,
					"errorCode":0,
					"model":null,
					"brightness":null,
					"brightnessRGBV":null,
					"calibrationMode":null,
					"displayMode":null,
					"gammaValue":null
				},
			]
		}
	]
}
```
### <a name="getByComPortName"></a>Запрос данных карты, по имени COM порта
запрос с параметром вернет краткие данные по устройству, подключенному к соответствующему порту, например :  
```Bash
http://127.0.0.1:5000/?port=COM6
```
результат :  

```JSON
{
	"error":0,
	"DVI":0,
	"autoBrightness":0,
	"screenPorts":[{
			"portNumber":0,
			"active":1,
			"brightness":20
		},
		{
			"portNumber":1,
			"active":0,
			"brightness":null
		},
		{
			"portNumber":2,
			"active":0,
			"brightness":null
		},
		{
			"portNumber":3,
			"active":0,
			"brightness":null
		}
	]
}
```
### <a name="setBrightness"></a>Установка яркости порта экрана
Параметры запроса : 
1. `port` - имя ком порта
2. `screenPort` - номер одного из четырех портов передающей карты (0-3)
3. `setBrightness` - значение яркости (0-255)

Например: 
```Bash
http://127.0.0.1:5000/?port=COM6&screenPort=0&setBrightness=10
```
### <a name="setBrightnessToAll"></a>Установка яркости всем портам экранов карты, подключенной к COM порту
Параметры запроса : 
1. `port` - имя ком порта
2. `screenPort` = `All`
3. `setBrightness` - значение яркости (0-255)

Для установки одинакового значения яркости всем портам экранов передающей карты необходимо в качестве параметра `screenPort` передать `All`, например :
```Bash
http://127.0.0.1:5000/?port=COM6&screenPort=All&setBrightness=255
```
### <a name="setAutoBrightness"></a>Установка режима автояркости карты, подключенной к COM порту
Параметры запроса : 
1. `port` - имя ком порта
3. `setAutoBrightness` - (0 / 1) 
	* 0 - режим автоматической установки яркости выключен
	* 1 - режим автоматической установки яркости включен

Например:
```Bash
http://127.0.0.1:5000/?port=COM6&setAutoBrightness=0
```
## <a name="Repository"></a>Адрес репозитория
* https://github.com/agbp/novastar-ws
* использует библиотеку https://github.com/sarakusha/novastar последней стабильной (на момент создания) версии : `1.0.5`

## <a name="Build"></a>Сборка
Важно !
В `packaje.json` указаны конкретные версии пакетов `@novastar (1.0.5)` и `serialport (9.2.8)` - как показала проверка в процессе разработки - эти версии совместимы, и с ними все работает, установка более поздних или других версий может привести к потере работоспособности сервиса.

## <a name="Executables"></a>Формирование исполняемых файлов
Для сборки сервиса в исполняемые файлы можно использовать пакет `pkg`  
https://www.npmjs.com/package/pkg  
https://github.com/vercel/pkg  
Пакет необходимо устанавливать глобально командой
```Bash
npm install -g pkg
```
для формирования исполняемых файлов применять команду : 
```Bash
pkg package.json
```
в результате работы в папке проекта `bin` будут созданы исполняемые файлы для платформ `windows`, `linux` и `mac` :
* novastar-ws-linux
* novastar-ws-macos
* novastar-ws-win.exe

## <a name="Contacts"></a>Контакты
Andrey.L.Golovin@gmail.com, +79183929922

