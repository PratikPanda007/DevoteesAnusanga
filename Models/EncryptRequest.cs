using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DevoteesAnusanga.Models
{
    public class EncryptRequest
    {
        public string DecryptedText { get; set; }
    }

    public class EncryptResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
    }
}