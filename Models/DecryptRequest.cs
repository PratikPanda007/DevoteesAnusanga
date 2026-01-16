using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DevoteesAnusanga.Models
{
    public class DecryptRequests
    {
        public string EncryptedText { get; set; }
    }

    public class DecryptResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
    }
}