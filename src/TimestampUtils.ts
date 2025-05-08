export type TimestampFormat = | 'F' | 'f' | 'D' | 'd' | 'T' | 't' | 'R';

export default {
    sec(seconds: number, format: TimestampFormat = 'R') {
        return `<t:${Math.floor(seconds)}:${format}>`;
    },
    ms(milliseconds: number, format: TimestampFormat = 'R') {
        return this.sec(milliseconds / 1000, format);
    },
    date(date: Date, format: TimestampFormat = 'R') {
        return this.ms(date.getTime(), format);
    }    
}