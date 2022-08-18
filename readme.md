# Web-сервис для мониторинга устройств novastar

1. [Запуск сервиса](#ServiceStart)
2. [Запросы к сервису](#RequestsExamples)
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
#### Запуск исходника на хосте с установленной NodeJS
```Bash
node ./dist/index.json port=3000
```
## <a name="RequestsExamples"></a>Запросы к сервису

`GET` запрос без параметров вернет полный список устройств, подключенных к хосту и их подробные характеритики, например :
```Bash
http://127.0.0.1:5000/
```

результат :  
```JSON
{
	"Error":0,
	"ErrorDescription":"",
	"SendingCards":
	[{
		"errorCode":0,
		"errorDescription":null,
		"COM":"COM6",
		"version":"4.7.7.0",
		"DVI":false,
		"autobrightness":false,
		"portInfo":{
			"path":"COM6",
			"manufacturer":"Silicon Laboratories",
			"serialNumber":"3e6cae33869beb11b2363ee3d922184a",
			"pnpId":"USB\\VID_10C4&PID_EA60\\3E6CAE33869BEB11B2363EE3D922184A",
			"locationId":"Port_#0006.Hub_#0001",
			"vendorId":"10C4",
			"productId":"EA60"
		},
		"portsData":[{
			"portNumber":1,
			"errorCode":0,
			"model":"Unknown ReceivingCard (4508h)",
			"brightness":255,
			"brightnessRGBV":{
				"overall":255,
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
		}]
	}]
}  
```
запрос с параметром вернет краткие данные по устройству, подключенному к соответствующему порту, например :  
```Bash
http://127.0.0.1:5000/?port=COM6
```
результат :  

```JSON
{
 "Error":0,
 "DVI":1,
 "Port1":0,
 "Port2":1
}
```
## <a name="Repository"></a>Адрес репозитория
https://github.com/agbp/novastar-ws

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

