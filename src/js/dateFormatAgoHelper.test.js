import { dateFormatAgoHelper } from './dateFormatAgoHelper.js';

describe('dateFormatAgoHelper', () => {
  let date;
  beforeEach(() => {
    date = new Date();
  });

  it('Should return +1 year ago', () => {
    const time = new Date(date.getFullYear() - 2);
    expect(dateFormatAgoHelper(time)).toEqual('+1 year ago');
  });
  it('Should return 1 month ago', () => {
    const time = new Date(date.getFullYear(), date.getMonth() - 1);
    expect(dateFormatAgoHelper(time)).toEqual('1 month ago');
  });
  it('Should return 2 months ago', () => {
    const time = new Date(date.getFullYear(), date.getMonth() - 2);
    expect(dateFormatAgoHelper(time)).toEqual('2 months ago');
  });
  it('Should return 1 day ago', () => {
    const time = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 1,
    );
    expect(dateFormatAgoHelper(time)).toEqual('1 day ago');
  });
  it('Should return 2 days ago', () => {
    const time = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 2,
    );
    expect(dateFormatAgoHelper(time)).toEqual('2 days ago');
  });
  it('Should return 1 hour ago', () => {
    const time = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours() - 1,
    );
    expect(dateFormatAgoHelper(time)).toEqual('1 hour ago');
  });
  it('Should return 2 hours ago', () => {
    const time = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours() - 2,
    );
    expect(dateFormatAgoHelper(time)).toEqual('2 hours ago');
  });
  it('Should return 1 minute ago', () => {
    const time = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes() - 1,
    );
    expect(dateFormatAgoHelper(time)).toEqual('1 minute ago');
  });
  it('Should return 2 minutes ago', () => {
    const time = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes() - 2,
    );
    expect(dateFormatAgoHelper(time)).toEqual('2 minutes ago');
  });
  it('Should return 1 second ago', () => {
    const time = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds() - 1,
    );
    expect(dateFormatAgoHelper(time)).toEqual('1 second ago');
  });
  it('Should return 2 seconds ago', () => {
    const time = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds() - 2,
    );
    expect(dateFormatAgoHelper(time)).toEqual('2 seconds ago');
  });
});
