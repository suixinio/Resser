const app = getApp() //获取应用实例
var article = '';
var favors = wx.getStorageSync('favors') || [];
var backTop = false;
var token = wx.getStorageSync('token')||'iLyhznUTQqyVkBiXmkyxhA';

Page({
  /**
   * Page initial data
   */
  data: {
    backTop: false,
    showButton: false,
    isfavored: false,
    favorid: -1,
    linkurl: '',
    title: '',
    source:'',
    author: '',
    pubTime: '',
    article: '',
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const that = this;
    var rssData = options.rssData;
    rssData = decodeURIComponent(rssData);
    rssData = JSON.parse(rssData);
    // console.log(rssData)
    var title = rssData.title;
    for (var i in favors) {
      if (favors[i].title == title) {
        this.setData({
          favorid: i,
          isfavored: true
        })
      }
    }
    if (rssData.article == undefined) {
      console.log('this feed have no content')
      wx.lin.showMessage({
        type: 'success',
        content: '正在获取全文',
        duration: 3000,
      })
      this.setData({
        title: rssData.title,
        author: rssData.author,
        pubTime: rssData.oriTime,
        linkurl: rssData.link,
        source: rssData.source,
      });
      this.getArticle(rssData.link)
    }
    else if (typeof(rssData.article)=='object'){
      this.setData({
        title: rssData.title,
        author: rssData.author,
        pubTime: rssData.oriTime,
        article: rssData.article,
        linkurl: rssData.link,
        source: rssData.source,
      });
    }
    else {
      var author = rssData.author;
      if (typeof(author)=='object') author = author.text;
      var pubTime = rssData.oriTime;
      var linkurl = rssData.link;
      var source= rssData.source,
      article = rssData.article;
      article = this.htmlDecode(article);
      article = app.towxml.toJson(article, 'html');
      try{
        this.setData({
          article,
          title,
          pubTime,
          author,
          linkurl,
          source
        }) 
      }catch(err){}
      
    }
      
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
    const linkurl = this.data.linkurl || '';
    if (this.data.article.child && this.data.article.child.length <= 1) {
      wx.lin.showMessage({
        type: 'success',
        content: '正在获取全文',
        duration: 3000,
      })
      this.getArticle(linkurl);
    }
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    token = wx.getStorageSync('token') || 'iLyhznUTQqyVkBiXmkyxhA';
    this.animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in',
      delay: 0
    });
    this.animationr = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in',
      delay: 0
    });
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  onMore: function(e){
    const that = this;
    var showButton = !this.data.showButton;
    this.setData({
      showButton,
    })
    if (showButton){
      this.animationr.rotate(180).step()
      this.animation.translateY(-20).step()
      this.setData({
        ani: this.animation.export(),
        anir: this.animationr.export()
      })
    }
    else {
      this.animationr.rotate(-180).step()
      // that.animation.translateY(20).step()
      this.setData({
        // ani: this.animation.export()
        anir: this.animationr.export()
      })
    }
  },

  onFavor: function (e) {
    if (!this.data.isfavored) {
      var obj = {};
      obj.article = this.data.article;
      obj.title = this.data.title;
      obj.pubTime = this.data.pubTime;
      obj.oriTime = this.data.oriTime;
      obj.author = this.data.author;
      obj.link = this.data.linkurl;
      obj.source= this.data.source;
      favors.unshift(obj);
      wx.setStorageSync('favors', favors);
      this.setData({
        isfavored: true
      })
      wx.lin.showMessage({
        type: 'success',
        content: '已收藏'
      })
    }
    else {
      var favorid = this.data.favorid;
      favors.splice(favorid, 1);
      wx.setStorageSync('favors', favors);
      this.setData({
        isfavored: false
      })
      wx.lin.showMessage({
        type: 'success',
        content: '收藏已取消'
      })
    }
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    const linkurl = this.data.linkurl || '';
    this.getArticle(linkurl);
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  onPageScroll: function (e) {
    var scrollTop = e.scrollTop
    backTop = scrollTop > 200 ? true : false
    if (backTop!=this.data.backTop){
      this.setData({
        backTop
      })
    }
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    })

  },

  copyLink: function (e) {
    var href = this.data.linkurl;
    wx.setClipboardData({
      data: href,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.hideToast();
            wx.lin.showMessage({
              type: 'success',
              content: '原文链接已复制'
            })
          }
        })
      }
    })
  },

  //复制页面中链接
  __bind_tap: function (e) {
    console.log(e);
    let element = e.target.dataset._el;
    if (element.tag == "navigator"){
      var href = element.attr.href;
      wx.setClipboardData({
        data: href,
        success: function (res) {
          wx.hideToast();
          wx.lin.showMessage({
            type: 'success',
            content: ' 内容已复制'
          })
        }
      })
    }
    else if (element.tag=="image"){
      wx.previewImage({
        current: element.attr.src,
        urls: [element.attr.src],
      })
    } 
  },

  htmlDecode: function (content) {
    var s = "";
    if (content.length == 0) return "";
    s = content.replace(/&amp;/g, "&");
    s = s.replace(/&#8211;/g, "–");
    s = s.replace(/<img src="https:\/\/c.statcounter.*?>/g, "");
    s = s.replace(/<img src="https:\/\/www.google-analytics.*?>/g,"");
    s = s.replace(/<img src="https:\/\/hm.baidu.*?>/g,"");
    s = s.replace(/<font color="red">订阅指南.*\n.*/g, "");
    s = s.replace(/<script>[\s\S]*?googletag[\s\S]*?>/g, "");
    s = s.replace(/<div>获取更多RSS[\s\S]*?<\/div>/g, "");
    s = s.replace(/<figure class="image"><img src="data:.*?base64,.*?<\/figure>/g,"");
    s = s.replace(/<script[\s\S]*<\/script>/g, "");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&#34;/g, "\"");
    s = s.replace(/&#xA;/g, "");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/&#123;/g, "{");
    s = s.replace(/&#125;/g, "}");
    s = s.replace(/&#124;/g, "|");
    s = s.replace(/&#126;/g, "~");
    return s;
  },
  
  backTop: function(){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
    this.setData({backtop:false});
  },
  getArticle: function (url) {
    var that = this;
    url = url.replace(/\*/g, "%2a");
    url = url.replace(/&#38;/g, "%26");
    
    wx.vrequest({
      data: {},
      header: {
        'Content-Type': 'application/xml',
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml; q=0.9,image/webp,*/*;q=0.8"
      },
      url: 'http://url2api.applinzi.com/demo/article?'+'&url=' + url
      ,
      success: function (res) {
        var r = JSON.parse(res.body);
        // var r = res.data
        var article = r["content"];
        // console.log(article);
        article = app.towxml.toJson(article, 'html');
        // console.log(article);
        that.setData({
          article: article,
        });
      }
    });
  },
})