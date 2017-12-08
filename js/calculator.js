

  var MAXBIT = 32
  var BLOCKS = 4

  var subnet = document.getElementById("subnet");
  var ip = document.getElementById("ip");
  var baseTable = document.getElementById("baseTable");
  var possibleTable = document.getElementById("possibleTable");
  var allPossibleNetwork = document.getElementById("allPossibleNetwork");

  function replaceStringAt(string, ch, index) {
    return string.substring(0, index) + ch + string.substring(index + 1)
  }

  function decToBit(string) {
    var bitString = parseInt(string, 10).toString(2)
    while (bitString.length < 8) {
      bitString = '0' + bitString
    }
    return bitString
  }

  function splitBit(ipString){
    blocks = []
    blocks[0] = ipString.substring(0,8)
    blocks[1] = ipString.substring(8,16)
    blocks[2] = ipString.substring(16,24)
    blocks[3] = ipString.substring(24,32)
    return blocks
  }

  function bitToDec(bitString) {
    return parseInt(bitString, 2).toString(10)
  }

  function splitBinToIp(ip){
    blocks = []
    blocks[0] = ip.substring(0,8)
    blocks[1] = ip.substring(8,16)
    blocks[2] = ip.substring(16,24)
    blocks[3] = ip.substring(24,32)
    return blocks
  }

  function mergeBinToDecIp(bitString){
    return bitToDec(bitString[0]) + '.' + bitToDec(bitString[1]) + '.' + bitToDec(bitString[2]) + '.' + bitToDec(bitString[3])
  }

  function mergeIp (ipArray) {
    return ipArray[0] + '.' + ipArray[1] + '.' + ipArray[2] + '.' + ipArray[3]
  }

  // Main function

  function networkAddress(){
    var ips = ip.value.split('.')
    var bitString = ""
    for (var i=0; i<BLOCKS; i++) {
      bitString += decToBit(ips[i])
    }

    for(var i=subnet.value; i<MAXBIT; i++){
      bitString = replaceStringAt(bitString, '0', i)
    }
    bitString = splitBit(bitString)
    bitString = mergeBinToDecIp(bitString)
    return bitString
  }

  function ipRange (network, broadcast) {
    var ipNetwork = network
    var ipBroadcast = broadcast
    if (ipNetwork == ipBroadcast) {
      return "NA"
    }

    var ipNetworks = ipNetwork.split('.')
    var ipBroadcasts = ipBroadcast.split('.')

    ipNetworks[3] = parseInt(ipNetworks[3]) + 1;
    ipBroadcasts[3] -= 1;

    ipNetwork = mergeIp(ipNetworks)
    ipBroadcast = mergeIp(ipBroadcasts)

    return ipNetwork + " - " + ipBroadcast
  }

  function broadcastAddress(ip){
    var ips = ip.split('.')
    var bitString = ""
    for (var i=0; i<MAXBIT; i++) {
      bitString += decToBit(ips[i])
    }

    for(var i=subnet.value; i<MAXBIT; i++){
      bitString = replaceStringAt(bitString, '1', i)
    }
    bitString = splitBit(bitString)
    bitString = mergeBinToDecIp(bitString)
    return bitString
  }

  function subnetMask() {
    var sub = 0xffffffff
    sub = sub.toString(2)
    for(var i=subnet.value; i<MAXBIT; i++){
      sub = replaceStringAt(sub, '0', i)
    }
    sub = splitBinToIp(sub)
    sub = mergeBinToDecIp(sub)
    return sub
  }

  function binSubnetMask () {
    var sub = 0xffffffff
    sub = sub.toString(2)
    for(var i=subnet; i<32; i++){
      sub = replaceStringAt(sub, '0', i)
    }
    sub = splitBit(sub)
    return mergeIp(sub)
  }

  function subClass(){
    if(subnet.value <= 8){
      return '-'
    }
    else if(subnet.value <= 16){
      return 'A'
    }
    else if(subnet.value <= 24){
      return 'B'
    }
    else if(subnet.value <= 32){
      return 'C'
    }
  }

  function binId () {
    var ips = ip.value.split('.')
    var bitString = ""
    for (var i=0; i<4; i++) {
      bitString += decToBit(ips[i])
    }
    return bitString
  }

  function WildcardMask () {
    var bitString = binSubnetMask()
    for (var i=0; i<bitString.length; i++) {
      if (bitString[i] == '0') {
        bitString = replaceStringAt(bitString, '1', i)
      } else if (bitString[i] == '1'){
        bitString = replaceStringAt(bitString, '0', i)
      }
    }
    sub = bitString.split('.')
    sub = mergeBinToDecIp(sub)
    return sub
  }

  function ipType() {
    var p = "Private"
    var ips = ip.value.split('.')
    if(ips[0] == "192" && ips[1] == "168"){
      return p
    }
    else if(ips[0] == "172" && parseInt(ips[1]) >= 16 && parseInt(ips[1]) <= 31 ){
      return p
    }
    else if(ips[0] == "10"){
      return p
    }
    return "Public"
  }

  function invertAddress () {
    var ips = ip.value.split('.')
    return ips[3] + '.' + ips[2] + '.' + ips[1] + '.' +  ips[0] + ".in-addr.arpa"
  }

  function getAllGroups () {
    var startIps = ip.value.split('.')
    var classNumber = subnet.value / 8
    classNumber = parseInt(classNumber)
    for(var i = classNumber; i < BLOCKS; i++) {
      startIps[i] = "0"
    }
    startIps = mergeIp(startIps)

    var range = Math.pow(2, ((classNumber + 1) * 8) - subnet.value)
    var network = startIps
    var broadcast
    var rangeAddress
    var result = []
    var i = 0

    do {
      broadcast = broadcastAddress(network)
      rangeAddress = ipRange(network, broadcast)

      result[i++] = [network, rangeAddress, broadcast]

      network = network.split('.')
      network[classNumber] = parseInt(network[classNumber]) + range
      network = mergeIp(network)
    } while (parseInt(broadcast.split('.')[classNumber]) < 255)
    return result
  }

  function createHeader(){
    allPossibleNetwork.innerHTML = "<h1>All Possible Networks</h1>"
  }

  function createPossibleTable() {
    headers = ["Network Address", "Usable Host Range", "Broadcast Address:"]
    data = getAllGroups()
    possibleTable.innerHTML = ""
    var tr = document.createElement("tr")
    for (var i=0; i<headers.length; i++) {
      var text = document.createTextNode(headers[i])
      var th = document.createElement("th")
      th.appendChild(text)
      tr.appendChild(th)
      possibleTable.appendChild(tr)
    }
    for (var i=0; i<data.length; i++) {
      var tr = document.createElement("tr")
      for (var j=0; j<data[i].length; j++) {
        var text = document.createTextNode(data[i][j])
        var td = document.createElement("td")
        td.appendChild(text)
        tr.appendChild(td)
      }
      possibleTable.appendChild(tr)
    }
  }

  function createBaseTable() {
    headers = ["IP Address", "Network Address", "Usable Host IP Range", "Broadcast Address", "Total Number of Hosts", "Number of Usable Hosts", "Subnet Mask", "Wildcard Mask", "Binary Subnet Mask", "IP Class", "CIDR Notation", "IP Type", "Short", "Binary ID", "Integer ID", "Hex ID", "in-addr.arpa"]
    data = [];
    data[0] = ip.value
    data[1] = networkAddress()
    data[2] = ipRange(networkAddress(), broadcastAddress(ip.value))
    data[3] = broadcastAddress(ip.value)
    data[4] = Math.pow(2, MAXBIT - subnet.value)
    data[5] = data[4] > 2 ? data[4] - 2 : 0
    data[6] = subnetMask()
    data[7] = WildcardMask()
    data[8] = binSubnetMask()
    data[9] = subClass()
    data[10] = '/' + subnet.value
    data[11] = ipType()
    data[12] = ip.value + ' /' + subnet.value
    data[13] = binId()
    data[14] = parseInt(parseInt(data[13], 2),10)
    data[15] = "0x" + data[14].toString(16)
    data[16] = invertAddress()
    baseTable.innerHTML = ""
    for (var i=0; i<headers.length; i++) {
      var tr = document.createElement("tr");
      var txt = document.createTextNode(headers[i]);
      var datum = document.createTextNode(data[i]);
      var th = document.createElement("th");
      var td = document.createElement("td");
      td.appendChild(datum)
      th.appendChild(txt)
      tr.appendChild(th)
      tr.appendChild(td)
      baseTable.appendChild(tr);
    }
  }

  function show() {
    createBaseTable()
    createHeader()
    createPossibleTable()
  }
