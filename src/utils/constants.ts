/**
 * UDealZone Constants
 */

// ============================================
// CATEGORIES
// ============================================

export const CATEGORIES = [
  {
    id: 1,
    name: 'Vehicles',
    image: '/Category/car-new.png',
    banner: '/banners/car.jpg',
    color: '#003049',
  },
  {
    id: 2,
    name: 'Bikes',
    image: '/Category/Bike.png',
    banner: 'https://www.nation.com.pk/digital_images/large/2021-03-29/honda-hikes-bike-price-by-rs-2-000-in-pakistan-1617028913-7955.jpg',

    icon: '🏍️',
    color: '#004d6d',
  },
  {
    id: 3,
    name: 'Property Sale',
    image: '/Category/PropertyforSale.png',
    banner: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxQTEhUTEhQWFhUXGRgaGBcYFxoaHRgYFxgdHhgaHhsgHiggGB0lHRcXIjEhJSkrLi4uGh8zODMsNygtLisBCgoKDg0OGxAQGi8lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAABgQFAQMHAgj/xABGEAACAQIEAwUFBQUHAwIHAAABAhEAAwQSITEFQVEGEyJhgTJxkaGxBxTB0fAjQlJy4RUzYoKSorJDwvEk0hYlRGSztOL/xAAZAQADAQEBAAAAAAAAAAAAAAAAAQIDBAX/xAAqEQACAgICAgIBAQkAAAAAAAAAAQIREiEDMQRBE1EykRQiUmFiccHh8P/aAAwDAQACEQMRAD8A4nRRRXqEBRRRQAUUUUAFFekQsYUEnoBNeSKACs8qxWeXrQwMUUUVQBRRRQIKKKKYwooopCCiiimAUUUUDCs1is0ABrFZNYoAKKKKBBRRRSAKKKKACiiigBo4D2QfEki1muECSEG3qd/hUDiPZ57bFZBI3B0P5V377O75KZn56AbKPco0HoKXPtOZfvSplUg2wdQCZLuPa9oaKNjXlryp2b/Gjh92wy+0CP11rXTxfwKHaV/3D8/rU3BcDwaBblyLrH92IE9MnM++Zrf9qVbRGDEbh/C718xats3U7KPex0HqaZ8F2KCjNibn+RNPixH0HrTW164RCKtm2Ni3hjyC8vdpVZiL1pdTmvN1bRf9PP3Gawl5M5daKUEj1w/ukIXDWZGzEL8ix1PuJ9wrfjeEYW/IuJkfrGU1VXOJ3GZROUSIC6ACdvdV4mOMQwDD/EKwbknaZSoVuIdgnEmw4cdDoaVsXg3tlldSpUw2mxIBHyrrOHdJ8LNbPxH51T8KxzG9iQ9nvUe/lLKueGCAajcCF3863h5M13slwRzWiuo4zsng785JtN5bT7qWeKdhMRbk24ur/h3+FdUPL45aeiHBoVKK24jDshh1KnoRFaq6UyQorNZRSdACT5U7A80VOw/CL7+zac+kfWjH8JvWf722yjqRpr58qn5I3VhTINFFFUIKKKKYBWaxWaACsUUUgM1iiigAooooGFFFFABRRRQI7r2O4vGVRO4GtK32uYq4cdZNsuD3CRlkye9u8tidql9mQZ7wZAEP775eWmkGan8UuWrjhrl4SAABZU7AkjUk66nWvETp2dL2hawuGuvaQsjl8viJXLB9YHTat+He5YBINuTpEhmHy29YrZxS8s+K5dPNVIAgcuvxqpvXARoI9SaeTYjfiMSzGWYn3morvUa61ebdwRrVqJJLw+rr/MPrTK1r1+tKmEebiRoMw+tM8N/4P51EikYe3G36/OoPZkkC8y6E3rv1/pUwOST0/XpUTsq/7JiR7Vy4f939KXoPYwLiyfbUN79D6EbVtt3V3Vyp6NqPQ7j51qQqRvr+v1vXg2P11rOijPELYuCLttLg6jX+tKOJ7PYYvIzKP4Z/UUwYsFRofwqoOJJbXfrVxlKP4sTSfZswXBcKNrRf3gmrjDqq+zZRemYiqoYhuZPxoz1Lcn2w0MaYs7d5bXplUn8qvmtqyBXVbigQSNfl1PlXP1u+dWVriLLsTUuP0BjjfYHDXZNhu7fpyn3cvSkTjPZPE4c+JMy/xLr8t66XZ40D7YnoRoRU+1jVb94Efwt+dbcfk8vH3slwTOGWbDOcqgk9KvMF2OxVzZAo6sfyroPEuz2HvHNlNq5yZdNffsarFe5bYpnDZdM0b1tPzpP8RLjXsrMJ9nLad7fRRzA1P1/Cji32fZVnD3c5G6tpPu0Hzq8OOufxH0MfSo44i6neR0aT8DuKyXk813kU4ROcY3BXLTZbiFT5j6daj11rE421eTJeUEdG/Bvz+NJ3aLs5atIbtu5lHJG5k8lI3/WtdnD5ak8ZKmZuFdCtRRRXZZAUUUUwCiiilYBRRRQA72cWUGmUzyKgx8a2jHuf3iPdA+lVt5wOdZS8K8Zo3JeIJME/OtIcbVIcSvpXngbOLuiI07d4gYb9DpQuhNBhuD3r/wDdW2cdQNPjsPjRxDsniLfjZXAHKAR56g12rgOIvDDljkY+EBIyKZYATAJ0momKtXLnftea14GFsJbtwAe7VycxJJ9uPSp+WQ6Rx3CYchlJ5EfWrw34Gm5r1xfChW0qDbuSfIaCn2CVFil0Aa1WdkFH3e3Mycx8/aNW63k7vxKNFJkSDpPTeo3ZDCq2FtkMQY6SPPpU3ofstbVvz+NSLdry+FaLbAPkzS2+x2qzsW/L4VDZVFNxNfDrBpTF7xsPxrofEsNKH8RXP7HAsQ7k5VE7eKTHLQTVRa9ks2tcFaWxNWP/AMJ4o6ZW9EP1MVY8M+zy9dbKTB83X6CTTuP2FMW1xkmKnYi/lq4x32c3LQzGARru8/EiKXuIqWTw7004t6Bpo22sUDzqUt49aXLfDbwGYR6H9Ct+HxboYcH1EVo4L0yUxmt8TdRvp0NRrILa/GvOHOZCRW/A2jXNLRokS7NkRrvUHHLDHpV5YtAVUcVHjOnT4RRF7E0U9zEhiwHIgTyMgkfIVQ9o3PgEmNdJ0nTWKn4Th1620lQQxGaG2nT1iZrzxzhly4A1tCwWc0cp209DXZwtRmtmbuhZorLKQYIgjkaxXpGQUUUUwCisVZYXFixlYW0disy8mNSNACI2qZNroCCLDclb4GirJu0V+dCo8gi/iCaKzy5fpfr/AKHovrHZjEXSO7tuQeiMfwj51d4L7OsSSRdm0I3KjfTSMwPX4U/ceW/beyBfUd44U+AsBKk6ZmI5c6scPYuNl7zF3XAPsgWlGgnUIgMeteU5Sa0bqrOYYjBjCv3dxEumAZIbblpmFSMJibZvrbS2qyheVAGzAR151L+0JR95WJ/u1n/U21UvC5GMQ8hZb4l1/I1MNpNlS0dWwd+LMf4rX/5UqEcTrjB/9wP/ANe1UMl3tZEZVkiSQTABkRBGuYDWahHBC0WbOWZh4iQBO2p5k6DUk0ia2mL/AGhfQxz/ADqmV1QasB0BIH9a3dpwWugZjAAMA6HVpPTlz8qqrNueunQ+flFbRWhN7LO/jlFhiJPgeNDGxI1MTuNprTwzixtYZctsMALSnxNuwVeSED4z5V4x9hVwtwhBOQiYGmvWpd+1lwyIvL7qTJ6uokeoHxopAbcJxCMYMwjwkQCNNNPayn5Ve9ocWhwWIiQe7aJVl8USIJAEiJ0qqS0WxpE+LIw/zAaD5DlU/tBhk+5XmChPBc2GX92QDG/PfrUNK0Vuh74NaS4qkEMIG0Hl5VFw3ELpa+toWla3jBh0lWy5SLZBYBxJHeRoQNNqhcLwSQmpJMDUKx9mdypYb9etL2FvXExd5Q5P/rSSoJGYqMPBElhME8j5zpEKKBtnQMbYu3PDdv6zH7OwgHxcsT8aXOzGBN61butjMT+0Fw5VupaACsQNEQHb/FUpuK3s+YWweZBCEjUjUjJ06VU/Z5xhlw9hMuirdE682PkF/wB1Qm30W412NWKwaWbb20zMCcxNy47sSyge08mPDttSH2YsAXkzICpKw0idc06eUL/q8qZe1PHbZvZdybcjaIUkHZmA3G51mqPgPEbduB/3W946F6tJk2N/FC2Ht3Q4S4tsDNCAFlJ0kMSOR2I9aice7M4NFIZMnsy4ZVHiH8JkR51C7T8etXcNi3QOoexaZREjxZyJKFlXluRTFi+IB7ls23RvGoMEH/pt0pS/dFHYk4nsyLKg2b1twwmCI0O2UiQ3vBipeE7J4iBKqmn7zr+E1LVi2GwhAEC0A2hJ0iNvX5U7I2gJP7oI03MVhzTknSNYpNCRxDgDWbednVtQIWTv6UuDgl3EXLvcqD3eTMJg+MGInQ+ya6Px10bDsMxMEFfjz6bkc9qU+yt28uJxi2AhYpZIDAmSFaAII89acZSxv2S0hU4jgrlrS4jIfMET67H0qpbGm0rso1AJGpGoFdQ4FxrGXsZ93xlm0too50RtSIj2jqN+RpI+03Bpav3ktqEXu80KIGq66cq34p3NQkiJRpWjlty4WJZjJOpJ5mvNFFe6cxmisVkCiwMVJxm1v+Qf8mrRkPSt+KXw2v5D8rjj8KltWgI1FZy0VVoD6R7VXAL+EIyR3u4PRDzjzq0+8CPbTnAka+H30onD2+YBPViXPxNV91FUtCr8K8K6VHTWyP21g4lZI1RR/uatWCWGoNxJ1VR5xWzAXgzwo2BM0k/Q2X+GeBUPimNS2pZ2CgdSKMTihaRnb2VEn3fr1rkPHuI3Ll12Lk5iY8UjKToPgRpvVxjkS3Qz9pcanfCGBGRdQZnV5E+8iq9uIW0gkyD0knfT8qUhWSdBW6jRnY58WxobCXMkkAAMQV0zMInWetXP3O9dCeHlbMtm9m04aIyjcga+/rXOrNx/ZDGDGknWDppz5V0TsZxdwi28xLAuTJmO8OaJ94J18/dUTtLRUdsmYfDul8XXUd2BrqSZ011XcnXf6VM43xNHwt+2Ac7o8DTcrEb1NfGXDuJ98Go9zFDnbH+muf5H7NcRh4TxW1kAziQAdtYgBhqCOVJ9vEI2OuhT/wDVhgZ1g/d+m8Qa3O9o72wPjWp7Fg8mB9/9KFNb0JocHtAwfFzX94Tz2O0aj1qj+zy0O6tyu3ekzGwJ21kmq5EUexeuL+vlXvh6vZjub+UCYBExm3361EKj7NZzyL7tna/9dZBQACwwjQ696DJ981D4WpBH+X/nVfibmIuXlutcRmVMnTw5pHrNbrZvrqHQR/LyM9K1zX2ZJG/tDbzYG8xliuBsbiR7D7EjSAQdD1qTj8MGK9RdAAY5tMkwM2aKrcTduNYuWZBz2FsTMwFzQwAgT4zNSm4hJQsns3FcnqAIgDX60OSYoqiNwR7hsW1DkwtwhT0S7ljWYgTsBT7huNqtpDcInKNACIhdDJOuo5CufcFvd0ArDbP/AL7hMddip2OxpqtcRsGwWV0YqnPTUZp399ZcqT9WXEncQ47Zu22tIzFpB1HQgtqOUsOVJOItkYm+Q7oRZRgUYrqM242YabEGpd3ilm6CbdwAi1dbMVAj9tZg8gZAOvnFLfGcXcDs4uWXVrYBIOSdTC5pImeXMaRV8MUnRE3oe+A8V7rEJbe6HW4bgBYEEZUEAaCRrr0g+8RO13CjfxOLItd4Uw1tgPFvFzSBoZjnSn2V4jfs4i3exNl7gAJDW2DGO78IKyTsRGv7sRTJx3j7d7isgZDdwiQGGsA3NYBkaNHl0iplFrlTj9FJ3E4YelWHA8PbuX7Vu6xW27hWYRIBMSJ06VFJmsCvYyk4nLqxr7edm7WCOG7lnYXbWcliDqGjSAIHlTW3ZPhw4N96JH3o4YXBN4z3nOEzR6RXKy50Ekgba7e7pXmKhxlS2O0em15xUjEr+ztHycfByf8AuqMDU7Ef3Nn33fqlPpgQcpor3NFVkx0juPdVXY0QW/XKrUY5OVtj/n/JfxrOS2x8VtRPV3P4ivIc0dKiJpUlqseEKA5J08P4irbGcNt6G2oXTWCx+pNQLmEVf3gW6eVNOwZIxjWnUo4DKdwdQa5v2s4PbtEG0TDEnLHs9Y8qfWWtTWgTMCa0i6IcbORrbJ9/OvSDQ/rX8K6Pe7NpdvIQQveOivvqGuAEjpodfIVL7adhzbCm2RbVbDs1tSSSbZWQABLCWWWM6up861zM3FnLrCmRG/Kuh9i+Gteu2+5KsVUm7HhgHNlLcm1B2n2t9qVRgHd7NspDXPFmYRKkFi3koUzsNidRXcuyfZFcIjKNzGuswCcs6kbQdKnleioLZCfs1cM6WzHnH4CahXeBXR/0p9zj/wBwrotrADJPiHqeXrUG7YaYzH5VzYGwgtwq6NO7u+gJ+k1FuYRh7SuP5l//AJrqiYNiM2Yz1qC9ts0QvwOvzoxA5n3S9V92X+tZFgcsvxI/Ouo/dWJkx/pEfA1EvcHU7qv+hfypUAgWMOJ1MTtqfyqy/wDh+66E21JHM5uXwq8xPCUGoUCOgpk7P3ALUeVCjvYM5hiOB3EMaE/4bltv+4GvH9mXwCQlwwJ0Q/UaU8XbS/ePKat+P2Va2CBBjl0p4iOOY/GOpCywE+I5TmX0In4Uu8axF1xBjLsXRgCV5Z1HP06evajwZbthicOjvBys1yI005Vy/tb2fu2Fm8bOZ4K27bMZJIlyGnTVtdKuEa2ZyF7hNlCl0m2zNk8BdWdYzLLZcoAUbZp3I01qHfupoAiKYA0nL5kgEkE6aTy86v7HCG7tpvCdQLQmCSZaAYjpAjWJqRwLAraxEM2ZUts4N7vbYbUT4WmHBJEbHXea1y9k1ZB4ZhsRYfDrauaXGBVQfAdDmBZdQYJnSfIwKa+MYYtcN64rhnw7aOoJV8zzsBuWgNyHOJputcJBuJcK211zFBMrvAByiDrvO81Sds3cXADdWWtMFUghpknQjfrqOtYLlymjXCkcatFREpuBG3Me73Vuyhk9gDxcgAYIO+lNXBPs9u3UDG4LYYaQocadSHEe6KtMb9nJVITEZnMaG3AgA6nxT0rql5EFqzJccvo58cD5Ee8VpuYRtY1pvvdjcSkwVI95Hyqufg+IQwbRO2sAiRVLnT6YsKF+3grmUHKYJ0OnKpF7+5tnpcuj/bbP41MxHe2gZXLB10MzETNRHM4cHpeb/dbX/wBtaQk330TRDmivNFa2hHZLPBcTzuKP8pP4Cp+H4NeYwb4Eazk+W81Ix2GwPe2DZbENbDObv7TGGV7vwbmT4ulTRieGgTbtXCw9kkXTDAae03IxXjPo6lIr8RbNsi2TJicw51Du8HRXFwsO8cERLSVBEkKdIBK6gcx1qbxPittnVlS6QFAPhUayer1o4jxfPkyWbgyhhr3f7xH+M9KcLrY5OJoTCgmtxwKjrVG3aQTJUoJYFnIUAr1MVO4fiDeBZGQ6xpcnX0Gla2RkixXgwvA21BLkMUhoi4qzbM8oYA+lRvtB7aWrNvD2yjvdvYRiW0ju76suUktmLd5aUkHkDrJrdwjFXbVxX/ZSDsXfmP5N9a5p9pGKa5iVFwAFEuKADML96vsB7hmgdQAa04anKiZukT27bYZL+DvWMHl+6ggguB3oNvLqQDz1kz86vbv223DOXBoPfdY/RRXJxWZrr+GLM1No6df+2zHTCWMMvkVuMf8AmPpUe59qHE2EjuFPQW+mvNj8N650ZBk71770gESYqJ8a9Ial9n19hr+ZAeoB+Imq6zjbb3biKfFbgOCCACwldYg6dK55w3tbiTFvvHEAR+zTYDY+Deq/+2MULl5le7+0ZQSEXXLoP3NNK4jbIsON9ssTaxVxUjIpjI078yG6AaxGvzq2w3b4HDB3Ud81zukSYBaNCWjRZiTyBpexnBho95LuZvFJ039Nqh3MJZy5ctxhDDL5OIbfaRpNSm72TbOp94r21dXVwVBzr7LSPaGux3Fa8AxCnKC3ijwief0pES3fdDcnEZFI0X2AeWgERrttRa45et6LeurMyAFH4aUSv0UpFnxPtDct3rgOFunuw7Eh7fsICS0Eg7CY3q8PFXui0q2LpFxQQ828qkicrS4MxGwI1Gtc/u8Qdi7s9whgVaT7QYEEE+Yn51JwGKxfd5rf3nu7ezAMVXKP4ojTz2p3oWQ/cF4or2swzAZ3t6j962WDbTp4G18qr+LcNGIvWcwi2s5yBJZpHzyqRrtPkKp+y2LuqjG293d2IEnc5mYjYAliSfOpmKw9x1BfvDbuNGoBlj7x5bipya6HaZu7Q9lkuEPYUpGjKy+DL5aEqeUiYGggUpYbCX2u5FN05JTxoIyli7KWA8QK2jDHfbSmRMKFuKoDgqJAyqCY5xEnlSx2+xdxLlhEa4DdW4GA0zd3GXaNR3l2fJjTi23Qm0dAwLB1kBSIkkACfQGDWv7spvK+UEKjj2ZymVPoSCaROw4vW3awFP3dWaGAnIx8QWSBMx03HoH3Pcs2rjrncldViMxA2nqR18qxlxu6Ra5EVy4zD4a4LJv2VDmQhYSjNtJGgmAIaIjetPEMRZLlvvWGGgH9+g2HvrnPE7FzGYgXMQLlrOSoL2ydEMaKqiQux32qy4t9mli0mYXL7bfuqRrsfZ21FaLigu2yPkkNOH4fdvgvhrlq6oME2rqsAd4kc4IqKnFktErdxFnMCQR3tpiCNxAckGeVWv2d8HbBYcoqs3eP3kMrAr4QI03HhBrn2M4OmI4hdsi6VzXbhVkEnOSSVAzc5In6U1FXXoHIi9p7N26r3CGKTuohZn1AP9aXbFsnDEDfvl+dtvyrqOPx2IwuCuYIFcrCNU18ZIgkmFOm8mkL+x79hHXEW+7Y3LRCsV2ZbonQ6CY3rbhlUTNoWWw8GJHxoplbh9znbA0GhyjcfzUVp8zJo7XxHhti0bNlAwDC5MlyxCRr/u6dKl43hGGV1/ZxKXSdWElEBU79SaVb+LuBnRXveGZm62gB0IExBBUnbn5RYYDHm4JLMTkcEFmIGaQIBJj2a5rNLQsXMQovIjExlJYKJ/eRQTGoHi08yN689qcSlq0GUOuYwpUsSTALanSBP061dYzD4SwnfXbSakAkICzEmYAiSZAPpVE/H8Ldyixhc4IMhwqAAcxAO/P0qotdhaoVsD3H7Pv0uupKs0EE5Q5Db7TB+XnXTuzfCLFvAYi9bUgEuwLAZlCqIAj12pCwvCLhaba5QIKjNJg6+I/Kn3gWDNq2ULPqTmGcgTsRA0IpTl6FEmcAwy95bzDkcwJmGAMzymMppI+1jsxnxb4hWCqUseGN2ZmQ/wAsFUJ87gp6uTbMqzARmjOd0jMPcVJPvFUf2o4X9hbu5mlLqgyxOZHIka9HFs+lHFyYukXKmJi/Zo39oLgTiVE2O+7wWyQBJGXLmk7bzzqxtfZMPvJw74uPCxkWtfCsxGerp1/+drLNP3PfMZ9s6T03q7srlxAuCTlW4N53WD9K1n5E10yFFM5Ld7LW1Rn75mUCVIQQ20jfTevVvskjYDD4pbjd5euXVKQMqi2TqDvyHxrdiMOyFgdFU6hSYiJMEz5VJ4TxFTw/D2MwBW5cmdIDMZOulW+WVXZNI6j9mYD4TM4BbvHOZgJ1VQPkKxiMFN3HhAsvZKiP4jaAXl1DH1NJ2HWFEk+8Egbco0FSLlx0MZ3B02uNzE9a5pSsvIeuP2rQwRa6obu7YMQTmIiFgAmCYExpM0n8JuXms2hhmFvwKDKgNnzEc9Vglus71THjrsxRGdoy+I3XjWJ0BkxI+NeMHjnuGLhIJ2h2184J1Gnly5030GSOqcJwASHZiz7F2PtAgESNgRrt1PU1T8UvEOYMDvZmeUn5UkK7HYPoJ8TGGE8jPLpXg41YkqDG4O/oefrUtjyGPtNdHdkqVaDZiCDyuHedDVl2Q4if7MvW9Qf241Gx7sH8aQLN8O2wAg6eoq1wfE0tobZuROfntmWN+WooTBNXsY+wGJJW7OhyXFI6Sq6e7T4EVY8OHhUgaZyRI5QRI98AetKHZjioGYd4pJVwGkDSBuNgQeY0PlTNfxC2kUEDQDcTsNJ+RpPTBPRf4O4h7jMQpVIIaBl8GuvvUD4Uhdo7ZxPE0t2yMttLoVlKkS8m5pOuly16GRVm+N8GciSDMRuB7Q9+5jnHOqLsViTc4jJIMLfGu/sYWfWT9auMrt/yE+qJfZXAYi3eQSMgcFw0EDxSze0NdPf4qa+2PB/vMBGMDNADMoJKiPLlVfa4g3esEUgljBIGmogEHaDOnUirbCXnZP2kZzmmJidPPzrHJMYi4+zbtWbNhrJuoWcTn8SSQDklYA05zrPSme5ge9w6AIbK2wO7USSQFgSAOZE+tR8FhITJqU9rUk7rMDpGb51Mwik5mDscpjKYhfCCOUiMppuTYkiPbx+JJRcPfVdEXK1uQCCsmSNQekjSqTiHCnTGNdUS6amAEGbQmANIOpH83Wmi9gMt3MhySRJ6GBqPyo4ngLt1RncMAvilBykxoPI6+furNzkhtCb20fvMWQx0buyx5BTAP/Lypex1qbYDHMQ4BY7wt9lWesA++o/FOJtce7JBKObYIEaIVA09K3z3veQBBYkCeuK/rXXCNdiLXB8Nu3EDrcuQ0n2iY1Om3Lb0rFS+G425ati1J8DOuggaORtRTxEX93D/APqbgjR7amfeVU8/8JqamHCARzKj3eVUHDcdh7ly4VuCQSQe8YHJmEAeLRZYD46VOscVsEwLytrP95mgjbUk1jl6Ei4+6K6ZWQOpOqkdOmm9L3EOBZGQW2yKxbNKy3stzAkjKT11A560y4MW29m83+VkMHpqprRcsd5ehnYm2wyEhDIIGaRliRMyIMHyMFjorma8hRRbDKAskkAnf+EZQdBp5mrDDa+uvzrSVyg7bjZQu0ztvy+NesKGMZSu2xBpDNfa1mTDpcT91xJ6BgV+BmKjdtr4u8Ka4RBbumA6EMrf8QT7jUrtLebuksFELX3VEbOYDBgRm8Ex7pqBxVj/AGeoZFypYu25DTmdUNtWUblY7xgSNiNBOh7TAiWvHxoHpgQfjcHx9qr06M/8tz/iaTeEcUQ8TDeIH7kiCBMupQkQDqIB0305Ux2uJK5fdTFwQwI6gb9dPjVz9f2BCx/ZZDEAeyDI1bWNdJ2ylSB7vdStwTDF8OgAYznkgAgBZIJn1+FddsWUZWOhJ+MgafhpSl2CwR/s620AqznN7i7BlOogeFDvMOTtUqeMXf2v8ktF12Z4STh2FwhpYKm/hBAZoPy9DVXwzCd6WzaqpggTJzSNDIpnTH27SsCcoWNT0W2oJmI5H50r9l+IAI5LaM2mh1jmPWam72ViecNwA97BJ8RkLOxIGmh1gA7HlV5guHKQGhZzErsN5AkjyWfea0ji9oOrM3s+W4MTvpI5ajnrrVthsUEBdoUJJ1kRIeCQB7JEt6HyklcgxSKnimFFu1lB8bEsPDGsid9howETINLmMUMJGjc/61v4pxsXbj3W0zcjHhHIb9IHpVNfx6z/AOPzpwi0KjVmykkaNB+o2rdgXVyoYcxOmkAzqOmvKB8ahXcavX6V7wGKUOLgYZgdomQdDPIjWDV0KrGnEC3btAqAZ1VY5nLLeQETz5jzGzFYsSArSo0AmYjkDqSOWtL+I4nmKkmABlGxIQDSNdPfvrUXE8ZA5j41nGDGqQ24HE+E6sRrKiDI8wQdPOovY5O6xtxm2AvgyY1D2UmOn7I7846Uv8O4xmmASwjKAD8fptWzht669y5FpnPjmCFK5rhJMkjmp+HKq/FSsGzpXD8YGvXGZRmnw68so1HI8qk2cXDydpOvv3+GX3zXP0w2IXLFxLbiSc0NKsYTaddD8qnXEdli5iGDbh7ax5FdZBGgrmnNL2PJDcLwyMcpB130mQNRMQNPlVfgeLLbd0JU5zzYCDlIiACdv6TVGQgTu3vO4aGYlwGhScvhEEAkty19KjTZBju0MQBmWZG4Ek8jyqXyq72JyHDifGAioxYS2Ux/MYDTz5GK2Ybimlwq2dWEZRMydDuY1Bn0NJd7ih/hUEDKjZRIWPD8JOm2grVc47oADlIIOjE69IPWTU5SbtIMzZwfs26X3uX1HdvezQTqS7+6ARIMzyr12owqhb19ECqUJ0M6khhBGkDY+Y0mq3GdoN5fLIiSY2JiJ31J1qqxnaRSjIzAhgQQsxrvp/WunjfPKSk0TsZUxtwT3qHPmYmbQY6sSNRvoRRSQ3ad50Zo94/rWa3w5vpDtjO+PJnwp4hB8JMjcjU+6tGJIua3FDHrlUE+8xJ9aoDiE5fWK9d+eR+ZrBcDj0RSGHBcKwBVXvXSr65kWyWj+GGzQfM6VNVsCjK9q5icykMrEx4hsdGpOuYhvL1rycUeZ/XwofBN7yYUOmOx+FuSAGUG5du6Ow8V3KG2GghBA8zVacWqFO5u3lAJn9ppEHYHnMHUGddqWnxrbSPgfzrx94/UVUeCS9gN+J4qbmQviLrG22ZNUEN10XWsPx1za7kOSgXIBlEBcmXcDoTSf968zXtcTT+CX2PJ/ZZ4PEH7457wrFvKGED+HT3a1cWLTMQfvJHmXQUmYW942br/AE/Kpn3ielVy8cm1T9INjwuP7nJOMQyWXKLiEiUMMwAmJgT1I868dlrttuG4eycQlme9LtmMrF0lRlXUkwvoT5Sk9/5VpwVwBAPw86PieFf97C2P3GcRhLpzXLxdsoDZBcVSRzgkVTI+GXRQ0DaHYfjVAb4HX0rwcT5H8azXjy/iYbGbvsPEFZ97MT8Z0q3ucetPhxaKyVK6zMoNVknchhz6zXPnvno3zrxbxUbEz5TVLxnT2wtjhdvYfnaWCY2JEkfAe+vE4cbWbfqJ+tLRLNuze4k1lnYCZ0FT+zSrt/qFF9faw2hs2/8ATH0qOWtAQttB/l/M1TDGD+Ifr0rYMT601wyXtiJaXVDQVkR8T+UVIwd9E/6VttSZIk6mfdptVY2K949QK1Njh1B+P5CtXxykqHtjQeOFR4Qqjy0+kVTcI4s6tccNq0z6u7f90+tVDYyep+X4n8K8pac6qje8gmfXSiHixjFr7HQ1HtCw1O8frzqPb4oEkkaEk6wNTvG3PX1NUXcYgbW7g56KV9ZAoThVw6tC+/U/l86a8XjSCi1xPGbehESNoG2+x/W9Qr3HOmaepYj8TPyrenA0HtOWPugfAHX41Os4aymypp11+smrXHxr0UoFLb4hffRASSdwCx92sipC8NxVz2iVA6sPoDVvd4lbA5EeS6fGI+NQr/Hl5QPSfpp86tf0oeKMYPsyuneO3uUKPmTVnheF4W3qUzfzkN8py/Kl6/xtjsPjp8hr86hPjnbQuY6CnjJ9sdpD999sDTInwA+VFc4kVil8QZm98GwrUQwq+Zh0PwP5VrZx0+Vb5EYlOLvWfjXoXuhNWDIp3AivBs2/1FJtfQYkFrh61jvTU5rSV57lKWgxIhu1jPO9Tfu60DDJ+jRoeJCz1kXTUv7ss7GsHCjkPnS0GJFZzWVYjn8q3jCj9GvRww5fWnoWJoLnnr6V57w8jH699SxhV8jWfu6jp8N6WgxIYuH+Ks95UvuRHs/H9fOvS2x0X4j8TrRoeJEW8Rz+dBxPLT6/WpvhH8PplP8A5rYt1f4o+H4ClY6K625J8OvpW02rh1g+pipwxa9SfT9frnXj7yvv9PzosKIv3J/4SesD8RVjgbNkRnt3PMwGHzK1r/tAdD8B+debnECTuYM7QfrSsKGjB4/DWwR3d4DqFVT8JH1rS3FbYnK1xQf47QJHqrTSycZzlviB9BXhsd0Ee/WanEoYm4yi7XPF1CuJ+LafCvV3tAygEO3wA+ZMzSm2JJM7e7SvIaZmnihF5d7RuZ1J8jBHwgCqjEYxmMmPRQPoK0PcFamemkDPb3SdyT61rJrzWxbJNXRNmsvWBrUy3gialWsFFFpCpsq+5NFXYtD9CilkPEqTfY7s3xNexdbqfjRRWoiQhqYFHQUUUmNGpFBOorNxB0G9FFSM9Cyv8I+ArRO9FFIEewdR76xeuHqfjRRQhkcuZ3PxrDGsUUCPPenqfjQGJ3JoopDAV650UUkBnlWOQ91YopDNnSvLUUUmDPJrD7UUUAa5ryKKKpCZ651k7UUUDNRorFFUiSRaFTbIoopMCTbrYaxRUDRkCiiikB//2Q==',
    icon: '🏠',
    color: '#F97316',
  },
  {
    id: 4,
    name: 'Property Rent',
    image: '/Category/PropertyforRent.png',
    banner: 'data:image/jpeg;base64,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',

    icon: '🏘️',
    color: '#facc15',
  },
  {
    id: 5,
    name: 'Mobiles',
    image: '/Category/mobiles.png',
    banner: 'https://www.samaa.tv/images/mobile-phones.jpg',

    icon: '📱',
    color: '#003049',
  },
  {
    id: 6,
    name: 'Electronics',
    image: '/Category/electronics.png',
    banner: 'https://cdn.metro-online.com/-/media/Project/MCW/PK_Metro/2020-to-2021/Product-World-2021/12-appliances.jpg?h=464&iar=0&w=1392&rev=44e671fb84bb4009a40522a023624dcb&hash=01002F834B2340B9A5426039F190F878',

    icon: '📺',
    color: '#004d6d',
  },
  {
    id: 7,
    name: 'Furniture',
    image: '/Category/furniture.png',
    banner: 'https://nmfurnisher.com/wp-content/uploads/2024/05/bed-room-furniture.png',

    icon: '🪑',
    color: '#F97316',
  },
  {
    id: 8,
    name: 'Animals',
    image: '/Category/animals.png',
    banner: 'https://wpassets.graana.com/blog/wp-content/uploads/2024/01/group-portrait-five-adorable-puppies_53876-64839.jpg',
    icon: '🐕',
    color: '#facc15',
  },
  {
    id: 9,
    name: 'Fashion',
    image: '/Category/Fashion.png',
    banner: 'https://www.pakstyle.pk/cdn/shop/articles/b14-ladies-dresses-buying-guide_9f67cede-1006-4149-b481-a8a18f8e9f3e.jpg?v=1758963154&width=800',

    icon: '👗',
    color: '#003049',
  },
  {
    id: 10,
    name: 'Services',
    image: '/Category/services.png',
    banner: 'https://www.kaamkrew.com/wp-content/uploads/2025/10/Image_fx-2025-10-07T180219.769.png',

    icon: '🔧',
    color: '#004d6d',
  },
] as const;

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_OTP: '/auth/verify-otp',
  RESET_PASSWORD: '/auth/reset-password',
  MY_ADS: '/my-ads',
  CATEGORY: '/category',
  ADD_POST: '/add-post',
  PRODUCT_DETAIL: '/product',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/ChangePassword',
  
  // OTP
  SEND_OTP: '/otp/send',
  VERIFY_OTP: '/otp/verifyOTP',
  VERIFY_FORGOT_OTP: '/otp/VerifyForgotPasswordOtp',
  FORGOT_PASSWORD: '/auth/ForgotPassword',
  
  // Home
  HOME_DEFAULT: '/Home/Home-Page-default',
  HOME_BY_CITY: '/Home/Home-Page-ByCity',
  HOME_BY_LOCATION: '/Home/Home-Page-By-Location',
  
  // Products
  PRODUCT_DETAIL: '/products/GetProductbyId',
  
  // Favorites
  TOGGLE_FAVORITE: '/ProductAction/UpsertFavorites',
  
  // My Ads
  MY_ADS: '/MyAds/GetMyAds',
  DELETE_AD: '/MyAds/DeleteProduct',
  MARK_AS_SOLD: '/MyAds/MarkAsSold',
  TOGGLE_FEATURED: '/MyAds/ToggleFeatured',
  UPDATE_AD: '/MyAds/UpdateProduct',
  
  // Categories
  CATEGORIES: '/Default/categories',
  SUBCATEGORIES: '/Default/subcategories',
  CITIES: '/Default/cities',
  VALIDATE_PROMO: '/Default/ValidatePromocode',
  
  // Chatbot
  CHAT: '/udeal-ai/chat',
  
  // Google Auth
  GOOGLE_SIGNIN: '/auth/SignInWithGoogle',
} as const;

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\d\s\-\+\(\)]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  OTP_LENGTH: 6,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  PRICE_MAX_VALUE: 999999999,
} as const;

// ============================================
// LOCAL STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'udealzone_access_token',
  REFRESH_TOKEN: 'udealzone_refresh_token',
  USER_DATA: 'udealzone_user_data',
  CITIES_CACHE: 'udealzone_cities_cache',
  CONVERSATION_ID: 'udealzone_conversation_id',
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_OTP: 'Invalid OTP. Please check and try again.',
  REQUIRED_FIELD: 'This field is required.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully.',
  SIGNUP_SUCCESS: 'Account created successfully. Welcome to UDealZone!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PASSWORD_RESET: 'Password reset successfully. You can now login with your new password.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  AD_DELETED: 'Ad deleted successfully.',
  AD_MARKED_SOLD: 'Ad marked as sold.',
  FAVORITE_ADDED: 'Added to favorites.',
  FAVORITE_REMOVED: 'Removed from favorites.',
} as const;

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  GOOGLE_AUTH: true,
  FACEBOOK_AUTH: false,
  LOCATION_BASED: true,
  CHATBOT: true,
  FEATURED_ADS: true,
  MESSAGING: false,
} as const;

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PRODUCTS_PER_CATEGORY: 4,
  MY_ADS_PAGE_SIZE: 12,
} as const;

// ============================================
// ANIMATION DURATIONS (ms)
// ============================================

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;
