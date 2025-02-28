User Guide for Show Replies from Blocked Users

Introduction
This deletes the lines of code that are responsible for removing entries made by
blocked uids:
set = set.filter(item => !blockedSet.has(parseInt(isPlain ? item : (item && item[property]), 10))); and makes changes to the test cases to ensure it is working correctly

How to Use the Feature
The test cases are meant to ensure replies from blocked uids are not filtered out
but users can test this feature by:
1. Finding a user that has replied to a discussion post
2. Blocking that user
3. Returning to the discussion post to verify the replies are still there

Link/Description
The file path is src/user/blocks.js and lines 92 - 112 include the function that    
previously filtered out the blocked uids but does not anymore. The test file can be 
found in test/user.js and lines 2557 - 2636 include the function that contains the 
relevant test cases. The first test case (lines 2557 - 2558) in the filter method 
creates a set of users, one of which is blocked. Then it checks to ensure that the 
set before and after filtering are equal. The second test case (lines 2590 - 2607) 
ensures that the length of the array and filtered uids match the original. The 
fourth test case (lines 2621 -2628) ensures that plain sets of uids contain blocked 
uids as well. The last test case (lines 2630 - 2635) ensures that the filter method 
compiles without errors before the other tests in this file. I believe the tests 
are sufficient for covering the changes that I have made because it checks for the 
presence of blocked uids, ensures the method works with a range of inputs, and 
creates no errors.

