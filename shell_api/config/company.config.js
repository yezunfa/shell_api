const company = {
    fusion: {
        domain: 'admin.cnhash.com',
        domainWhiteList:  [ 'https://www.51fusion.com' ],
        imgServer:  {
            savePath: '/mnt/data1/assets/', // 图片上传保存路径
            host: '//assets.51fusion.com/'
        }
    },
    madingyu: {
        domain: 'madingyu.com',
        domainWhiteList:  [ 'https://www.madingyu.com' ],
        imgServer:  {
            savePath: '/mnt/data1/assets/', // 图片上传保存路径
            host: '//madingyu.com/'
        }
    }

}

const getCompanyConfig = () => {
    let companyConf = company.fusion;
    if(process.argv[2]) {
        const nmpRunStartOption = JSON.parse(process.argv[2]);
        if(nmpRunStartOption.company) {
            companyConf = company[nmpRunStartOption.company];
        }
    }
    return companyConf
}


module.exports = {
    company,
    getCompanyConfig
};