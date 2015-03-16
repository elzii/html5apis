var APP = (function ($) {

  /**
   * Modules
   *
   * app
   * tvdb
   */
  var app     = {}
  var storage = window.LSTORE;
  var stencil = window.STENCIL;


  /**
   * Module Properties
   *
   * config
   * url
   * data
   * $el
   * 
   */
  app = {

    // Config
    config : {
      environment : window.location.href.match(/(localhost)/g) ? 'development' : 'production',
      debug : window.location.href.match(/(localhost)/g) ? true : false
    },

    // URLs
    url : {
      site : window.location.href.match(/(localhost)/g) ? 'http://localhost/projects/showfeed/' : 'http://showfeed.io/'
    },

    // Elements
    $el : {
      body : $('body'),

      views : {
        index : $('#view--index'),
        people : $('#view--people'),
      },

      nav : {
        main : $('#nav--main')
      },

      loader : $('#loader'),

      debug : $('#debug'),
    },

    // Settings
    settings : {

    },

    // Directories
    dir : {
      js : rootLocation() + 'js/',
      css : rootLocation() + 'css/',
      images : rootLocation() + 'images/',
    },

    

  };



  /**
   * Init
   */
  app.init = function () {

    this.events()

    this.notifications.init()
    this.objectObserve.init()
    this.mediaCapture.init()
    this.tabChange.init()

  }




  /**
   * Notifications
   */
  app.notifications = {

    // Elements
    $el : $('*[data-notification]'),

    // Initialize
    init: function() {

      var _this = app.notifications;

      if ( !_this.isCompatible() ) { return false; }

      _this.events()

    },

    /**
     * Show Notification
     * 
     * @param  {Object}   data      [title, body, timeout]
     * @param  {Function} callback 
     */
    show: function(data, callback) {

      var _this = app.notifications;

      if ( _this.isCompatible() ) {
        Notification.requestPermission(function (status) { 
          
          var title   = data.title ? data.title : 'Notification Title',
              body    = data.body ? data.body : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
              icon    = data.icon ? data.icon : false,
              dir     = data.dir ? data.dir : 'auto',
              tag     = data.tag ? data.tag : null,
              timeout = data.timeout ? data.timeout : false;

          // Create new notifications instance
          var n = new Notification( title, { 
            body : body,
            tag  : tag,
            icon : icon,
            dir  : dir
          })

          // Autoclose if timeout passed
          if ( timeout ) {
            _this.close(n, timeout)
          }

          // Notification specific events
          n.addEventListener('click', function (event) {
            if ( app.config.debug ) console.log('%cEVENT:', 'color:#a422bc', 'Notification.onclick()', event)
          })
          n.addEventListener('close', function (event) {
            if ( app.config.debug ) console.log('%cEVENT:', 'color:#a422bc', 'Notification.onclose()', event)
          })

          if ( callback ) callback(n, status)
        })
      }

    },

    /**
     * Close Notification
     * 
     * @param  {Object}   notification 
     * @param  {Integer}   timeout      
     * @param  {Function} callback     
     */
    close: function(notification, timeout, callback) {

      var notification = notification ? notification : {};

      // If no timeout, set 2nd param as callback
      if ( timeout && typeof timeout == 'function' ) {
        timeout = callback
        notification.close()
      } 
      // Close on timeout interval passed
      else if ( timeout && typeof timeout == 'number' ) {
        setTimeout(function() {
          notification.close()
        }, timeout)
      } 
      // No callback or timeout, just close
      else {
        notification.close()
      }

    },


    /**
     * Event Bindings
     *
     * click
     */
    events: function() {

      var _this = app.notifications;

      // Fire notification via data attributes
      $(document).on('click', _this.$el.selector, function (event) {

        event.preventDefault()

        var $this     = $(this),
            title     = $this.data('notification-title'),
            body      = $this.data('notification-body'),
            tag       = $this.data('notification-tag'),
            icon      = $this.data('notification-icon'),
            direction = $this.data('notification-direction'),
            timeout   = $this.data('notification-timeout');

        // Show the notification
        _this.show({
          title   : title,
          body    : body,
          tag     : tag,
          icon    : icon,
          dir     : direction,
          timeout : timeout
        }, function (n) {
          if ( app.config.debug ) console.log('%cCALLBACK:', 'color:#66d9ef', 'notification.show()', n)
        })

      })


      // Request permissions
      $(document).on('click', '*[data-notification-request-permission]', function (event) {

        event.preventDefault()

        _this.requestPermission(function (result) {
          _this.show({
            title   : 'Request Permission',
            body    : result,
            timeout : 2000
          })
        })

      })



      
    },


    /**
     * Request Permission
     */
    requestPermission: function(callback) {

      Notification.requestPermission(function (result) {
        if ( result !== 'granted' ) {
          console.log('%cERROR:', 'color:#bc2226', 'Permission was not granted.')
          callback(result)
          return;
        } else {
          console.log('%cSUCCESS:', 'color:#26bc22', 'Permission granted.')
          callback(result)
        }
      })

    },


    /**
     * Is Compatible
     * 
     * @return {Boolean} true/false
     */
    isCompatible: function() {
      if ( window.Notification ) {
        return true;
      } else {
        console.log('window.Notification not supported.')
        return false;
      }
    },

    

  }






  /**
   * Object Observe
   */
  app.objectObserve = {

    $el: $('*[data-test-object-observe]'),

    model : {
      title : 'Model Title',
      value : 0
    },

    /**
     * Initialize
     */
    init: function() {

      var _this = app.objectObserve;

      // Start observing
      _this.observe( _this.model )

      // Events
      _this.events()

    },


    /**
     * Event Listeners
     */
    events: function() {

      var _this = app.objectObserve;

      // Test an object change
      $(document).on('click', _this.$el.selector, function (event) {

        event.preventDefault()

        _this.model.date = (new Date())

      })

    },

    /**
     * Observe
     */
    observe: function(object) {

      Object.observe( object, function (changes) {

        changes.forEach(function (change) {

          console.log('Change: ' + object + ' -> ', change)
          console.log('Object: ' + object + ' -> ', change.object)

          app.output.log('object-observe', change )
        })


      })
    }

  }







  /**
   * Media Capture
   */
  app.mediaCapture = {

    $el: {
      start : $('*[data-media-capture]'),
      stop  : $('*[data-media-capture-stop]')
    },


    /**
     * Initialize
     */
    init: function() {

      var _this = app.mediaCapture;

      _this.events()


    },



    /**
     * Event Listeners
     */
    events: function() {

      var _this = app.mediaCapture;

      // Test media capture
      $(document).on('click', _this.$el.start.selector, function (event) {

        event.preventDefault()

        // Create video element & append
        var video = _this.createVideoElement('video', 'video-container');

        _this.getUserMedia( video, {
          audio : true,
          video : true
        })

      })

      // Stop capture
      $(document).on('click', _this.$el.stop.selector, function (event) {

        event.preventDefault()

        // Create video element & append
        var video = document.querySelector('video')

        video.pause()

      })      


    },

    /**
     * Create Video Element
     * 
     * @param  {String}  id     
     * @param  {String}  target 
     * @return {Element} video
     */
    createVideoElement: function(id, target) {

      if ( document.getElementsByTagName('video') && document.getElementsByTagName('video').length > 0 ) {
        document.getElementsByTagName('video')[0].remove()
      }

      // Video element
      var video = document.createElement('video')
          video.id = id;
          video.setAttribute('autoplay', 'true')

      var container = document.getElementById(target)
          container.appendChild( video )

      return video;

    },


    /**
     * Get User Media
     * 
     * @param  {Element} video  
     * @param  {Object} option 
     */
    getUserMedia: function(video, option) {

      // Defaults
      var video   = video ? video : document.getElementById('video'),
          options = options ? options : {
            audio : true,
            video : true
          }

      // Cross-Browser Compatibility
      navigator.getUserMedia  = navigator.getUserMedia ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia ||
                                navigator.msGetUserMedia;
      
      // If browser supports
      if ( navigator.getUserMedia ) {
        navigator.getUserMedia( options, function (stream) {

          video.src = window.URL.createObjectURL(stream)

        }, function (error) {
          console.log( 'ERROR: ', error)
        })
      } 
      // Not supported
      else {
        video.src = 'fallback-video.webm';
      }

    }


  }













  /**
   * Tab Change
   *
   * Change the tab's title if the user changes tabs
   */
  app.tabChange = {

    /**
     * Initialize
     */
    init: function() {

      var _this = app.tabChange;

      _this.tabEvent( 'Come back!' )

    },

    /**
     * Tab Event
     * 
     * @param  {String} title 
     */
    tabEvent: function(title) {

      var orig_title = document.title,
          blur_title = title ? title : 'Tab blurred';

      document.addEventListener('visibilitychange', function (event) {

        document.title = ((document.hidden) ? blur_title : orig_title)

      })
    }

  }










  /**
   * Event Listeners
   */
  app.events = function() {

    // Dropdown toggle
    $(document).on('click', '.col-collapsable .col-header', function (event) {

      event.preventDefault()

      var $this = $(this),
          $col  = $this.parent()

      $col.toggleClass('col-collapsed')

    })

  }




  /**
   * Loader
   */
  app.loader = {
    show : function() { app.$el.loader.show() },
    hide : function() { app.$el.loader.hide() }
  }


  /**
   * Output
   */
  app.output = {

    $el : $('*[data-output]'),

    init: function() {

    },

    log: function(id, message) {

      var _this   = app.output,
          $output = $(_this.$el.selector+'#output--'+id)

      // Object
      if ( typeof message == 'object' ) {
        message = JSON.stringify( message, null, 2 )
      } 
      // Array
      else if ( typeof message == 'array' ) {
        message = message.toString()
      }
      else {
        message = message.toString()
      }

      $output.html( message )

    },

  }



  /**
   * Curl Request
   * 
   * @param  {Object} options 
   *        
   */
  function curlRequest(options) {

    var options = options || {},
        request;

    options.url        = options.url || '';
    options.data_type  = options.data_type || 'xml';
    options.parse_json = options.parse_json || true;
    options.callback   = options.callback || undefined;

    request = $.ajax({
      url: 'ajax.php',
      type: 'POST',
      data : {
        action : 'curl',
        url : url,
        convertXML : true
      }
    })
    .done(function (data) {
      
      if ( options.parse_json ) {
        var json  = $.parseJSON(data),
            items = json.channel.item

        callback(items)
      } else {
        callback(data)
      }

    })
    .fail(function (data) {
      console.log("error", data);

      callback(data)
    })
  }  


  /**
   * searchStringInArray
   */
  function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
  }


  /**
   * substringBetween
   */
  function substringBetween( string, start, end ) {
    return string.substring( show.link.lastIndexOf(start)+1, show.link.lastIndexOf(end) );
  }

  /**
   * replaceAllInString
   */
   function replaceAllInString(find, replace, str) {
     return str.replace(new RegExp(find, 'g'), replace);
   }


  /**
   * Generate Slug
   *
   * convert to lowercase, remove dashes and pluses, replace spaces with dashes
   * remove everything but alphanumeric characters and dashes
   */
  function generateSlug (value) {
    return value.toLowerCase().replace(/-+/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  };


  /**
   * Populate HTML Template Variables
   * 
   * @param  {String} html    
   * @param  {Object} data     
   * @param  {RegEx} pattern 
   * @return {String}
   */
  function populateTemplateVars(template_html, data, pattern) {

    var template_html = template_html || null,
        data          = data || {},
        pattern       = pattern || /\{\{(.*?)\}\}/g;

    // Find the template vars
    var template_vars = template_html.match( pattern )

    template_vars.forEach(function (key, k) {
      
      // Get string value between double brackets to use as key
      var key_clean = key.replace('{{', '').replace('}}', '')

      // Replace HTML with real data values
      template_html = template_html.replace(key, data[key_clean])

    })

    return template_html;

  };






  /**
   * Random String
   * 
   * @param  {Integer} length 
   * @param  {Sting} chars  
   * @return {String}
   *
   * @usage randomString(32, '#aA'), randomString(8, 'aA')
   */
  function randomString(length, chars) {
    var mask = '';

    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    
    var result = '';

    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];

    return result;
  };

  /**
   * Root Location
   * @return {[type]} [description]
   */
  function rootLocation() {

    var href = window.location.href,
        hash = window.location.hash;

    if ( hash.length > 0 ) {
      return href.replace(hash, '')
    } else {
      return href.replace('#', '')
    }

  }

  /**
   * Size Prototype
   * 
   * @param  {Object} obj 
   * @return {Integer}     
   */
  Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };










  /**
   * DOCUMENT READY
   * -------------------------------------------------------------------
   *
   */
  document.addEventListener('DOMContentLoaded', function (event) {

    app.init()

    
  })



  return app;
})(jQuery);