# Web-сервис для мониторинга устройств novastar

1. [Запуск сервиса](#ServStart)
2. [Запросы к сервису](#RequestsExamples)
3. [Адрес репозитория](#Repository)
4. [Сборка](#Build)
5. [Формирование исполняемых файлов](#Executables)
6. [Контакты](#Contacts)

## <a name="ServStart"></a>Запуск сервиса
При имеющемся exe файле сервиса `novastar-ws-win.exe` - скопировать его на хост и запустить без параметров.  
```Bash
novastar-ws-win.exe
```
При запуске без параметров сервис использует порт `5000`  
В качестве параметра можно укахзать номер порта на котором будет работать сервис :  
```Bash
./bin/novastar-ws-win.exe port=3000
```
#### Запуск исходника на хосте с установленной NodeJS
```Bash
node ./dist/index.json port=3000
```
## <a name="RequestsExamples"></a>Запросы к сервису

`GET` запрос без параметров вернет полный список устройств, подключенных к хосту и их подробные характеритики например :
```Bash
http://127.0.0.1:5000/
```

результат :  
```JSON
{
 "Error":false,
 "ErrorDescription":"",
 "SendingCards":
 [{
  "COM":"COM6",
  "Version":"4.7.7.0",
  "DVI":true,
  "Port1":false,
  "Port1Model":null,
  "Port2":true,
  "Port2Model":"Unknown ReceivingCard (4508h)",
  "Error":null,"ErrorDescription":null
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

## <a name="Build"></a>СБОРКА
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

## <a name="Contacts"></a>контакты
Andrey.L.Golovin@gmail.com, +79183929922

