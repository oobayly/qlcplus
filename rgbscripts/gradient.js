/*
  Q Light Controller Plus
  gradient.js
  
  Copyright (c) Massimo Callegari

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0.txt

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// Development tool access
var testAlgo;

(
  function()
  {
    var algo = new Object;
    algo.apiVersion = 2;
    algo.name = "Gradient";
    algo.author = "Massimo Callegari";
    algo.acceptColors = 0;
    algo.properties = new Array();
    algo.presetIndex = 0;
    algo.properties.push("name:presetIndex|type:list|display:Preset|values:Rainbow,Sunset,Abstract,Ocean|write:setPreset|read:getPreset");
    algo.presetSize = 5;
    algo.properties.push("name:presetSize|type:range|display:Size|values:1,20|write:setSize|read:getSize");
    algo.orientation = 0;
    algo.properties.push("name:orientation|type:list|display:Orientation|values:Horizontal,Vertical|write:setOrientation|read:getOrientation");
    
    var util = new Object;
    util.initialized = false;
    util.gradientData = new Array();
    util.presets = new Array();
    util.presets.push(new Array(0xFF0000, 0x00FF00, 0x0000FF));
    util.presets.push(new Array(0xFFFF00, 0xFF0000));
    util.presets.push(new Array(0x5571FF, 0x00FFFF, 0xFF00FF, 0xFFFF00));
    util.presets.push(new Array(0x003AB9, 0x02EAFF));
    
    algo.setPreset = function(_preset)
    {
      if (_preset == "Rainbow") algo.presetIndex = 0;
      else if (_preset == "Sunset") algo.presetIndex = 1;
      else if (_preset == "Abstract") algo.presetIndex = 2;
      else if (_preset == "Ocean") algo.presetIndex = 3;
      else algo.presetIndex = 0;
      util.initialize();
    }
    
    algo.getPreset = function()
    {
      if (algo.presetIndex == 0) return "Rainbow";
      else if (algo.presetIndex == 1) return "Sunset";
      else if (algo.presetIndex == 2) return "Abstract";
      else if (algo.presetIndex == 3) return "Ocean";
      else return "Rainbow";
    }
    
    algo.setSize = function(_size)
    {
      algo.presetSize = _size;
      util.initialize();
    }
    
    algo.getSize = function()
    {
      return algo.presetSize;
    }
    
    algo.setOrientation = function(_orientation)
    {
      if (_orientation == "Vertical")
	algo.orientation = 1;
      else
	algo.orientation = 0;
      util.initialize();
    }

    algo.getOrientation = function()
    {
      if (algo.orientation == 1)
	return "Vertical";
      else
	return "Horizontal";
      util.initialize();
    }

    util.initialize = function()
    {
      // calculate the gradient for the selected preset
      // with the given width
      var gradIdx = 0;
      util.gradientData = new Array();
      for (var i = 0; i < util.presets[algo.presetIndex].length; i++)
      {
	var sColor = util.presets[algo.presetIndex][i];
	var eColor = util.presets[algo.presetIndex][i + 1];
	if (eColor == undefined)
	  eColor = util.presets[algo.presetIndex][0];

	util.gradientData[gradIdx++] = sColor;
	var sr = (sColor >> 16) & 0x00FF;
	var sg = (sColor >> 8) & 0x00FF;
	var sb = sColor & 0x00FF;
	var er = (eColor >> 16) & 0x00FF;
	var eg = (eColor >> 8) & 0x00FF;
	var eb = eColor & 0x00FF;

	var stepR = ((er - sr) / (algo.presetSize));
	var stepG = ((eg - sg) / (algo.presetSize));
	var stepB = ((eb - sb) / (algo.presetSize));
	//alert("Steps - R: " + stepR + " G: " + stepG + " B: " + stepB);

	for (var s = 1; s < algo.presetSize; s++)
	{
	  var gradR = Math.floor(sr + (stepR * s)) & 0x00FF;
	  var gradG = Math.floor(sg + (stepG * s)) & 0x00FF;
	  var gradB = Math.floor(sb + (stepB * s)) & 0x00FF;
	  var gradRGB = (gradR << 16) + (gradG << 8) + gradB;
	  util.gradientData[gradIdx++] = gradRGB;
	  //alert("Pushing " + gradRGB.toString(16));
	}
      }
      util.initialized = true;
    }

    /**
      * The actual "algorithm" for this RGB script. Produces a map of
      * size($width, $height) each time it is called.
      *
      * @param step The step number that is requested (0 to (algo.rgbMapStepCount - 1))
      * @param rgb Tells the color requested by user in the UI.
      * @return A two-dimensional array[height][width].
      */
    algo.rgbMap = function(width, height, rgb, step)
    {
        if (util.initialized == false)
	{
	  if (algo.orientation == 0)
	    util.initialize(width);
	  else
	    util.initialize(height);
	}

	var gradStep = 0;
	var map = new Array(height);
	for (var y = 0; y < height; y++)
	{
	    map[y] = new Array();

	    if (algo.orientation == 1)
	      gradStep = step + y;

	    for (var x = 0; x < width; x++)
	    {
	      if (algo.orientation == 0)
		gradStep = step + x;
	      if (gradStep >= util.gradientData.length)
		gradStep -= util.gradientData.length;

	      map[y][x] = util.gradientData[gradStep];
	    }
	}

	return map;
    }

    /**
      * Tells RGB Matrix how many steps this algorithm produces with size($width, $height)
      *
      * @param width The width of the map
      * @param height The height of the map
      * @return Number of steps required for a map of size($width, $height)
      */
    algo.rgbMapStepCount = function(width, height)
    {
	if (util.initialized == false)
	  util.initialize();

        return util.gradientData.length;
    }

    // Development tool access
    testAlgo = algo;

    return algo;
    }
)()