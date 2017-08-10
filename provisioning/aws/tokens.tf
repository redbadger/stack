# resource "aws_vpc_endpoint" "private_s3" {
#   vpc_id       = "${var.vpc_id}"
#   service_name = "com.amazonaws.${var.region}.s3"
# }
#
# data "aws_iam_policy_document" "s3_through_endpoint" {
#   statement {
#     sid     = "Access-to-specific-VPCE-only"
#     effect  = "Deny"
#     actions = ["s3:*"]
#
#     resources = [
#       "arn:aws:s3:::${aws_s3_bucket.tokens.id}",
#       "arn:aws:s3:::${aws_s3_bucket.tokens.id}/*",
#     ]
#
#     condition {
#       test     = "StringNotEquals"
#       variable = "aws:sourceVpce"
#       values   = ["${aws_vpc_endpoint.private_s3.id}"]
#     }
#
#     principals {
#       type        = "AWS"
#       identifiers = ["*"]
#     }
#   }
# }
# resource "aws_vpc_endpoint_route_table_association" "private_s3" {
#   vpc_endpoint_id = "${aws_vpc_endpoint.private_s3.id}"
#   route_table_id  = "${aws_route_table.private_s3.id}"
# }
#
# resource "aws_s3_bucket_policy" "s3_through_endpoint" {
#   bucket = "${aws_s3_bucket.tokens.id}"
#   policy = "${data.aws_iam_policy_document.s3_through_endpoint.json}"
# }
#
# resource "aws_s3_bucket" "tokens" {
#   bucket        = "microplatform.tokens"
#   acl           = "private"
#   force_destroy = true
#
#   tags {
#     Name = "Tokens"
#   }
# }

