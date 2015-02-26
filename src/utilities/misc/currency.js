/**
 * @author xuld
 */

/**
 * 提供货币计算相关函数。
 */
var Currency = {

    /**
	 * 计算货币的和。
	 */
    add: function (x, y) {
        return Math.round(x * 100 + y * 100) / 100;
    },

	/**
	 * 计算货币的差。
	 */
    sub: function (x, y) {
        return Currency.add(x, -y);
    },

    /**
	 * 计算货币的积。
	 */
    mul: function(x, y) {
        return Math.round(x * 100 * y) / 100;
    },

    /**
	 * 计算货币的商。
	 */
    div: function (x, y) {
        return Math.round(x * 100 / y) / 100;
    },

    /**
	 * 精确到两位小数点。
	 */
    round: function (x) {
        return Math.round(x * 100) / 100;
    },

    /**
	 * 保留两位小数转为字符串。
	 */
    toString: function (x) {
        var t = Math.round(Math.abs(x) * 100),
            result = Math.floor(x) + '',
            c = (result.length - 1) % 3 + (x < 0 ? 2 : 1);

        return result.substr(0, c) + result.substr(c).replace(/(\d{3})/g, ',$1') + '.' + Math.floor(t / 10) % 10 + t % 10;
    },

    /**
	 * 保留两位小数转为字符串。
	 */
    toChinese: function (x) {

        var fractions = '角分',
            digits = '零壹贰叁肆伍陆柒捌玖',
            units0 = '元万亿',
            units1 = ['', '拾', '佰', '仟'],
            neg = x < 0,
            s = '',
            i,
            p, 
            j,
            t;

        x = Math.abs(x);

        // 零。
        if (x < 0.005) {
            return '零元整';
        }

        // 得到小数点后两位。
        t = Math.round(x * 100) % 100;
        s += t ? (t >= 10 ? digits[Math.floor(t / 10)] + '角' : '') + (t % 10 ? digits[t % 10] + '分' : '') : '整';

        // 得到整数位。
        t = Math.floor(x);
        for (i = 0; i < units0.length && t > 0; i++) {
            p = '';
            for (j = 0; j < units1.length && t > 0; j++) {
                p = digits[t % 10] + units1[j] + p;
                t = Math.floor(t / 10);
            }
            s = (p.replace(/(零.)*零$/, '') || '零') + units0[i] + s;
        }

        return (neg ? '负' : '') + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零');
    }

};
